from fastapi import APIRouter

router = APIRouter()

@router.get("/placeholder")
async def sessions_placeholder():
    return {"message": "Sessions module placeholder - Stage 3 coming soon!"}
