"""应用配置 —— 从 .env 加载"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ---- 应用 ----
    APP_NAME: str = "RuralTourism"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_SECRET_KEY: str = "change-me"

    # ---- 服务端口 ----
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    # ---- 数据库 ----
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "rural_tourism"

    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    # ---- JWT ----
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 168

    # ---- 短信 ----
    SMS_DEBUG_MODE: bool = True
    SMS_PROVIDER: str = ""
    SMS_ACCESS_KEY: str = ""
    SMS_ACCESS_SECRET: str = ""
    SMS_SIGN_NAME: str = ""
    SMS_TEMPLATE_CODE: str = ""

    # ---- AI 剧本生成 ----
    SCRIPT_LLM_PROVIDER: str = "deepseek"
    SCRIPT_LLM_API_KEY: str = ""
    SCRIPT_LLM_BASE_URL: str = "https://api.deepseek.com"
    SCRIPT_LLM_MODEL: str = "deepseek-chat"
    SCRIPT_LLM_MAX_TOKENS: int = 8192
    SCRIPT_LLM_TEMPERATURE: float = 0.8

    # ---- AI NPC 对话 ----
    CHAT_LLM_PROVIDER: str = "deepseek"
    CHAT_LLM_API_KEY: str = ""
    CHAT_LLM_BASE_URL: str = "https://api.deepseek.com"
    CHAT_LLM_MODEL: str = "deepseek-chat"
    CHAT_LLM_ENABLE_THINKING: bool = False
    CHAT_LLM_MAX_TOKENS: int = 1024
    CHAT_LLM_TEMPERATURE: float = 0.9
    CHAT_CONTEXT_ROUNDS: int = 20

    # ---- AI 图片生成 ----
    IMAGE_LLM_PROVIDER: str = "zhipu"
    IMAGE_LLM_API_KEY: str = ""
    IMAGE_LLM_BASE_URL: str = "https://open.bigmodel.cn/api/paas/v4"
    IMAGE_LLM_MODEL: str = "cogview-4"
    IMAGE_DEFAULT_SIZE: str = "1536x864"
    IMAGE_DEFAULT_STYLE: str = "realistic"
    IMAGE_NEGATIVE_PROMPT: str = "blurry, watermark, text, signature, low quality, distorted, modern buildings"

    # ---- 安全过滤 ----
    SENSITIVE_WORDS_ENABLED: bool = True
    SENSITIVE_WORDS_FILE: str = "config/sensitive_words.txt"
    CONTENT_SECURITY_ENABLED: bool = False
    CONTENT_SECURITY_API_KEY: str = ""

    # ---- OSS ----
    OSS_PROVIDER: str = "aliyun"
    OSS_ENDPOINT: str = ""
    OSS_ACCESS_KEY_ID: str = ""
    OSS_ACCESS_KEY_SECRET: str = ""
    OSS_BUCKET_NAME: str = ""

    # ---- 地图 ----
    MAP_PROVIDER: str = "tencent"
    MAP_API_KEY: str = ""
    MAP_API_SECRET: str = ""

    # ---- 部署 ----
    DOMAIN: str = "localhost"
    ENABLE_HTTPS: bool = False
    DOCKER_PORT: int = 8000

    @property
    def db_url(self) -> str:
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    @property
    def redis_url(self) -> str:
        pw = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{pw}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "allow",
    }


settings = Settings()
