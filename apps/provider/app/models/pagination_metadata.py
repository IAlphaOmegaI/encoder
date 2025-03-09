from pydantic import BaseModel

class PaginationMetadata(BaseModel):
    page: int
    limit: int
    itemCount: int
    pageCount: int