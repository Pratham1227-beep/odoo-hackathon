import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.features.auth.models import User
from app.core.security import verify_password, hash_password

async def test_passwords():
    common_passwords = ["Admin@123", "admin123", "Admin@1234", "admin@1234", "password", "password123", "123456", "admin", "1234", "admin@123"]
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        for u in users:
            matched = []
            for p in common_passwords:
                if verify_password(p, u.password_hash):
                    matched.append(p)
            print(f"User: {u.email} (Role: {u.role}) -> Matched Passwords: {matched}")

if __name__ == "__main__":
    asyncio.run(test_passwords())
