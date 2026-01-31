from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from sqlmodel import Session, select

from src.core.config import settings
from src.core.db import engine
from src.models.users import User


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


# @lru_cache
def get_config():
    return settings


security = HTTPBearer()


# @lru_cache
def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(uri=settings.CLERK_JWKS_URL, cache_keys=True)


def verify_clerk_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    token = credentials.credentials

    try:
        jwks_client = get_jwks_client()
        signin_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signin_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_JWT_ISSUER,
            options={"verify_aud": False},  # Clerk doesn't always set audience
        )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token was expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


ClerkTokenDep = Annotated[dict, Depends(verify_clerk_token)]


def get_current_user(token_payload: ClerkTokenDep, session: SessionDep) -> User:
    clerk_id = token_payload.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.exec(select(User).where(User.clerk_id == clerk_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found. "
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User is deactivated"
        )

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
