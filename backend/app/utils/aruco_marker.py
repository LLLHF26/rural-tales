"""AR 标记生成器 — 生成 ARToolKit 兼容标记（粗黑边框 + 内部图案）"""

import struct
import zlib
from pathlib import Path

import cv2
import numpy as np
from cv2 import aruco

MARKERS_DIR = Path("static/markers")
DICT = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)

# 标记尺寸参数
MARKER_SIZE = 400       # 输出图片尺寸
BORDER_RATIO = 0.15     # 粗黑边框占图片尺寸比例
INNER_RATIO = 0.55      # 内部图案区域占比（黑边框内侧的白色区域 + ArUco）


def _create_marker_image(marker_id: int) -> np.ndarray:
    """
    生成 ARToolKit 兼容的完整标记图像（用于打印）：
    - 白色外边距
    - 粗黑边框（ARToolKit 用于定位）
    - 内部填满 ArUco 图案（用于唯一识别 → .patt）
    """
    img = np.ones((MARKER_SIZE, MARKER_SIZE), dtype=np.uint8) * 255

    # 黑边框范围：占图像 10%-30%
    outer_b = int(MARKER_SIZE * 0.10)   # 40px
    inner_b = int(MARKER_SIZE * 0.30)   # 120px
    # 内部图案区域尺寸
    pattern_size = MARKER_SIZE - 2 * inner_b  # 160px

    # 生成 ArUco 标记（含白边），然后裁掉白边得到纯 4x4 编码区
    raw_marker = aruco.generateImageMarker(DICT, marker_id % 50, 200, borderBits=1)
    cell = 200 // 6  # 6x6 网格，每个 cell 约 33px
    aruco_pattern = raw_marker[cell:5*cell, cell:5*cell]  # 裁掉外围白边，保留 4x4 编码区

    # 放大 ArUco 图案填满内部
    pattern = cv2.resize(aruco_pattern, (pattern_size, pattern_size), interpolation=cv2.INTER_NEAREST)

    # 绘制：白底 → 黑框 → 图案
    cv2.rectangle(img, (outer_b, outer_b), (MARKER_SIZE - outer_b, MARKER_SIZE - outer_b), 0, -1)
    cv2.rectangle(img, (inner_b, inner_b), (MARKER_SIZE - inner_b, MARKER_SIZE - inner_b), 255, -1)
    img[inner_b:inner_b + pattern_size, inner_b:inner_b + pattern_size] = pattern

    return img


def _get_pattern_image(marker_id: int) -> np.ndarray:
    """获取纯 ArUco 4x4 编码图案（裁掉白边），用于生成 .patt 文件"""
    raw = aruco.generateImageMarker(DICT, marker_id % 50, 200, borderBits=1)
    cell = 200 // 6  # 6x6 网格
    return raw[cell:5*cell, cell:5*cell]  # 裁掉外围白边


def _make_patt(marker_img: np.ndarray) -> str:
    """
    将标记图像转换为 AR.js .patt 格式。
    使用完整图片缩放到 16x16（与 AR.js PatternMarkerGenerator 行为一致）。
    """
    resized = cv2.resize(marker_img, (16, 16), interpolation=cv2.INTER_AREA)

    rotations = [
        resized,
        cv2.rotate(resized, cv2.ROTATE_90_COUNTERCLOCKWISE),
        cv2.rotate(resized, cv2.ROTATE_180),
        cv2.rotate(resized, cv2.ROTATE_90_CLOCKWISE),
    ]

    lines = []
    for i, rot in enumerate(rotations):
        rgb = cv2.cvtColor(rot, cv2.COLOR_GRAY2RGB)
        for ch in [2, 1, 0]:  # B, G, R
            for y in range(16):
                row_vals = [str(int(rgb[y, x, ch])) for x in range(16)]
                lines.append(" ".join(row_vals))
        if i < len(rotations) - 1:
            lines.append("")

    return "\n".join(lines) + "\n"


def generate_marker(marker_id: int) -> str:
    """生成标记 PNG（完整标记）及其 .patt 文件，返回 PNG 相对 URL"""
    MARKERS_DIR.mkdir(parents=True, exist_ok=True)

    # 完整标记 PNG（用于打印）
    marker_img = _create_marker_image(marker_id)
    png_filename = f"marker_{marker_id}.png"
    cv2.imwrite(str(MARKERS_DIR / png_filename), marker_img)

    # .patt 必须和 AR.js 实际看到的黑框内部区域一致
    # 从完整标记中提取黑框内的部分（inner_b 到 MARKER_SIZE-inner_b）
    inner_b = int(MARKER_SIZE * 0.30)  # 120px
    interior = marker_img[inner_b:MARKER_SIZE - inner_b, inner_b:MARKER_SIZE - inner_b]
    patt_content = _make_patt(interior)
    patt_filename = f"marker_{marker_id}.patt"
    (MARKERS_DIR / patt_filename).write_text(patt_content)

    return f"/static/markers/{png_filename}"


def generate_marker_url(marker_id: int) -> str:
    """生成标记，如果已存在则直接返回 URL"""
    png_file = MARKERS_DIR / f"marker_{marker_id}.png"
    patt_file = MARKERS_DIR / f"marker_{marker_id}.patt"
    if png_file.exists() and patt_file.exists():
        return f"/static/markers/marker_{marker_id}.png"
    return generate_marker(marker_id)
