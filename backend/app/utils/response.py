"""统一响应格式"""


def ok(data=None, message="success") -> dict:
    return {"code": 0, "message": message, "data": data}


def fail(code: int, message: str, data=None) -> dict:
    return {"code": code, "message": message, "data": data}
