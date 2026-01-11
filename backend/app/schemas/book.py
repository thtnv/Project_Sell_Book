from pydantic import BaseModel
from decimal import Decimal


class BookList(BaseModel):
    book_id: str

    title: str
    stock_quantity: int
    price: Decimal
    cover_image_url: str | None

    class Config:
        from_attributes = True

class BookDetail(BaseModel):
    book_id: str
    title: str
    author: str
    publisher: str | None
    publication_year: int | None
    price: Decimal
    stock_quantity: int
    sold_quantity: int
    description: str | None
    cover_image_url: str | None
    category_name: str | None

    class Config:
        from_attributes = True