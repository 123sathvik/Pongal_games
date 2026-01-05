from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import secrets
import hashlib

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Pongal Games API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


active_sessions = {}
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = hashlib.sha256(
    os.getenv("ADMIN_PASSWORD", "pongal2026").encode()
).hexdigest()


# Supabase client
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    return create_client(url, key)

supabase: Client = get_supabase()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str

class AuthResponse(BaseModel):
    authenticated: bool
    message: Optional[str] = None

# Pydantic Models
class GameBase(BaseModel):
    icon: str
    tamil: str
    english: str
    category: str

class GameCreate(GameBase):
    pass

class Game(GameBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ScheduledGameCreate(BaseModel):
    game_id: int
    scheduled_time: str
    date: str
    venue: str
    participants: List[str]
    game_type: str = "team"
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None

class ScheduledGameUpdate(BaseModel):
    scheduled_time: Optional[str] = None
    date: Optional[str] = None
    venue: Optional[str] = None
    participants: Optional[List[str]] = None
    is_active: Optional[bool] = None
    registration_open: Optional[bool] = None
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None

class ScheduledGame(BaseModel):
    id: int
    game_id: int
    scheduled_time: str
    date: str
    venue: str
    participants: List[str]
    game_type: str
    is_active: bool
    registration_open: bool
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TeamRegistrationCreate(BaseModel):
    scheduled_game_id: int
    team_name: str
    captain_name: str
    captain_phone: Optional[str] = None
    captain_email: Optional[str] = None
    players: List[str]

class TeamRegistration(BaseModel):
    id: int
    scheduled_game_id: int
    team_name: str
    captain_name: str
    captain_phone: Optional[str] = None
    captain_email: Optional[str] = None
    players: List[str]
    registered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IndividualRegistrationCreate(BaseModel):
    scheduled_game_id: int
    player_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None

class IndividualRegistration(BaseModel):
    id: int
    scheduled_game_id: int
    player_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    registered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ScoreUpdate(BaseModel):
    participant_index: int
    score_change: int

class TimeUpdate(BaseModel):
    participant_index: int
    time: str

class GameResult(BaseModel):
    winner_name: str
    winner_score: Optional[int] = None
    winner_time: Optional[str] = None

class ActiveGameState(BaseModel):
    scheduled_game_id: int
    current_scores: dict  # JSON object with participant scores/times
    status: str = "playing" 

class ScheduledGameCreate(BaseModel):
    game_id: int
    scheduled_time: str
    date: str
    venue: str
    participants: List[str]
    game_type: str = "team"
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None
    is_league: bool = False
    league_stage: Optional[str] = None
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    parent_game_id: Optional[int] = None

class ScheduledGameUpdate(BaseModel):
    scheduled_time: Optional[str] = None
    date: Optional[str] = None
    venue: Optional[str] = None
    participants: Optional[List[str]] = None
    is_active: Optional[bool] = None
    registration_open: Optional[bool] = None
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None
    is_league: Optional[bool] = None
    league_stage: Optional[str] = None
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None

class ScheduledGame(BaseModel):
    id: int
    game_id: int
    scheduled_time: str
    date: str
    venue: str
    participants: List[str]
    game_type: str
    is_active: bool
    registration_open: bool
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None
    is_league: bool = False
    league_stage: Optional[str] = None
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    parent_game_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlayerUpdate(BaseModel):
    player_name: str

# API Routes

@app.get("/")
async def root():
    return {"message": "Pongal Games API", "version": "2.0"}

# Admin Endpoints

async def verify_admin_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.replace("Bearer ", "")
    
    if token not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Check if token is expired (24 hours)
    session = active_sessions[token]
    if datetime.now() > session["expires_at"]:
        del active_sessions[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    return session

# Auth endpoints
@app.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Admin login endpoint"""
    # Hash the provided password
    password_hash = hashlib.sha256(credentials.password.encode()).hexdigest()
    
    # Verify credentials
    if credentials.username != ADMIN_USERNAME or password_hash != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Generate session token
    token = secrets.token_urlsafe(32)
    
    # Store session (expires in 24 hours)
    active_sessions[token] = {
        "username": credentials.username,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    
    return LoginResponse(
        token=token,
        message="Login successful"
    )

@app.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Admin logout endpoint"""
    if not authorization:
        return {"message": "No active session"}
    
    token = authorization.replace("Bearer ", "")
    
    if token in active_sessions:
        del active_sessions[token]
    
    return {"message": "Logged out successfully"}

@app.get("/auth/verify", response_model=AuthResponse)
async def verify_token(session = Depends(verify_admin_token)):
    """Verify if token is valid"""
    return AuthResponse(
        authenticated=True,
        message=f"Authenticated as {session['username']}"
    )

# Protected admin endpoints - add Depends(verify_admin_token) to secure them
@app.post("/games", response_model=dict)
async def create_game(game: dict, session = Depends(verify_admin_token)):
    """Create a new game (Protected)"""
    try:
        response = supabase.table("games").insert(game).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduled-games", response_model=dict)
async def create_scheduled_game(scheduled_game: dict, session = Depends(verify_admin_token)):
    """Create a new scheduled game (Protected)"""
    try:
        response = supabase.table("scheduled_games").insert(scheduled_game).execute()
        result = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("id", response.data[0]["id"]).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/games/{game_id}")
async def delete_game(game_id: int, session = Depends(verify_admin_token)):
    """Delete a game (Protected)"""
    try:
        response = supabase.table("games").delete().eq("id", game_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Game not found")
        return {"message": "Game deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/scheduled-games/{scheduled_game_id}")
async def delete_scheduled_game(scheduled_game_id: int, session = Depends(verify_admin_token)):
    """Delete a scheduled game (Protected)"""
    try:
        response = supabase.table("scheduled_games").delete().eq("id", scheduled_game_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        return {"message": "Scheduled game deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/games", response_model=List[Game])
async def get_games():
    """Get all games"""
    try:
        response = supabase.table("games").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/games/{game_id}", response_model=Game)
async def get_game(game_id: int):
    """Get a specific game by ID"""
    try:
        response = supabase.table("games").select("*").eq("id", game_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Game not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/games", response_model=Game)
async def create_game(game: GameCreate):
    """Create a new game"""
    try:
        response = supabase.table("games").insert({
            "icon": game.icon,
            "tamil": game.tamil,
            "english": game.english,
            "category": game.category
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/games/{game_id}")
async def delete_game(game_id: int):
    """Delete a game"""
    try:
        response = supabase.table("games").delete().eq("id", game_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Game not found")
        return {"message": "Game deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SCHEDULED GAMES ENDPOINTS ====================

@app.get("/scheduled-games", response_model=List[dict])
async def get_scheduled_games():
    """Get all scheduled games with game details"""
    try:
        response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scheduled-games/active", response_model=List[dict])
async def get_active_games():
    """Get all active games"""
    try:
        response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scheduled-games/open-registration", response_model=List[dict])
async def get_open_registration_games():
    """Get all games with open registration"""
    try:
        response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("registration_open", True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scheduled-games/{scheduled_game_id}", response_model=dict)
async def get_scheduled_game(scheduled_game_id: int):
    """Get a specific scheduled game"""
    try:
        response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("id", scheduled_game_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduled-games", response_model=dict)
async def create_scheduled_game(scheduled_game: ScheduledGameCreate):
    """Create a new scheduled game"""
    try:
        game_response = supabase.table("games").select("*").eq("id", scheduled_game.game_id).execute()
        if not game_response.data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        response = supabase.table("scheduled_games").insert({
            "game_id": scheduled_game.game_id,
            "scheduled_time": scheduled_game.scheduled_time,
            "date": scheduled_game.date,
            "venue": scheduled_game.venue,
            "participants": scheduled_game.participants,
            "game_type": scheduled_game.game_type,
            "is_active": False,
            "registration_open": True,
            "max_teams": scheduled_game.max_teams,
            "max_players_per_team": scheduled_game.max_players_per_team
        }).execute()
        
        result = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("id", response.data[0]["id"]).execute()
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/scheduled-games/{scheduled_game_id}", response_model=dict)
async def update_scheduled_game(scheduled_game_id: int, update: ScheduledGameUpdate):
    """Update a scheduled game"""
    try:
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        response = supabase.table("scheduled_games").update(
            update_data
        ).eq("id", scheduled_game_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        
        result = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("id", scheduled_game_id).execute()
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/scheduled-games/{scheduled_game_id}/activate")
async def toggle_game_activation(scheduled_game_id: int):
    """Toggle game activation status"""
    try:
        current = supabase.table("scheduled_games").select("is_active").eq("id", scheduled_game_id).execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        
        new_status = not current.data[0]["is_active"]
        
        response = supabase.table("scheduled_games").update({
            "is_active": new_status
        }).eq("id", scheduled_game_id).execute()
        
        return {"id": scheduled_game_id, "is_active": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/scheduled-games/{scheduled_game_id}/registration")
async def toggle_registration(scheduled_game_id: int):
    """Toggle registration open/close status"""
    try:
        current = supabase.table("scheduled_games").select("registration_open").eq("id", scheduled_game_id).execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        
        new_status = not current.data[0]["registration_open"]
        
        response = supabase.table("scheduled_games").update({
            "registration_open": new_status
        }).eq("id", scheduled_game_id).execute()
        
        return {"id": scheduled_game_id, "registration_open": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/scheduled-games/{scheduled_game_id}")
async def delete_scheduled_game(scheduled_game_id: int):
    """Delete a scheduled game"""
    try:
        response = supabase.table("scheduled_games").delete().eq("id", scheduled_game_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        return {"message": "Scheduled game deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TEAM REGISTRATION ENDPOINTS ====================

@app.get("/team-registrations/{scheduled_game_id}", response_model=List[TeamRegistration])
async def get_team_registrations(scheduled_game_id: int):
    """Get all team registrations for a scheduled game"""
    try:
        response = supabase.table("team_registrations").select("*").eq(
            "scheduled_game_id", scheduled_game_id
        ).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Replace the team registration endpoint in main.py with this updated version

@app.post("/team-registrations", response_model=TeamRegistration)
async def create_team_registration(registration: TeamRegistrationCreate):
    """Register a team for a scheduled game"""
    try:
        # Check if game exists and registration is open
        game = supabase.table("scheduled_games").select("*").eq(
            "id", registration.scheduled_game_id
        ).execute()
        
        if not game.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        
        if not game.data[0].get("registration_open", True):
            raise HTTPException(status_code=400, detail="Registration is closed for this game")
        
        if game.data[0]["game_type"] != "team":
            raise HTTPException(status_code=400, detail="This game is not a team event")
        
        # Check max teams limit
        if game.data[0].get("max_teams"):
            existing = supabase.table("team_registrations").select("id").eq(
                "scheduled_game_id", registration.scheduled_game_id
            ).execute()
            if len(existing.data) >= game.data[0]["max_teams"]:
                raise HTTPException(status_code=400, detail="Maximum teams limit reached")
        
        # Check max players per team limit
        if game.data[0].get("max_players_per_team"):
            if len(registration.players) > game.data[0]["max_players_per_team"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Maximum {game.data[0]['max_players_per_team']} players allowed per team"
                )
        
        # Check if team name already exists
        existing_team = supabase.table("team_registrations").select("*").eq(
            "scheduled_game_id", registration.scheduled_game_id
        ).eq("team_name", registration.team_name).execute()
        
        if existing_team.data:
            raise HTTPException(status_code=400, detail="Team name already registered")
        
        response = supabase.table("team_registrations").insert({
            "scheduled_game_id": registration.scheduled_game_id,
            "team_name": registration.team_name,
            "captain_name": registration.captain_name,
            "captain_phone": registration.captain_phone,
            "captain_email": registration.captain_email,
            "players": registration.players
        }).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/team-registrations/{registration_id}")
async def delete_team_registration(registration_id: int):
    """Delete a team registration"""
    try:
        response = supabase.table("team_registrations").delete().eq("id", registration_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Registration not found")
        return {"message": "Team registration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== INDIVIDUAL REGISTRATION ENDPOINTS ====================

@app.get("/individual-registrations/{scheduled_game_id}", response_model=List[IndividualRegistration])
async def get_individual_registrations(scheduled_game_id: int):
    """Get all individual registrations for a scheduled game"""
    try:
        response = supabase.table("individual_registrations").select("*").eq(
            "scheduled_game_id", scheduled_game_id
        ).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/individual-registrations", response_model=IndividualRegistration)
async def create_individual_registration(registration: IndividualRegistrationCreate):
    """Register an individual for a scheduled game"""
    try:
        # Check if game exists and registration is open
        game = supabase.table("scheduled_games").select("*").eq(
            "id", registration.scheduled_game_id
        ).execute()
        
        if not game.data:
            raise HTTPException(status_code=404, detail="Scheduled game not found")
        
        if not game.data[0].get("registration_open", True):
            raise HTTPException(status_code=400, detail="Registration is closed for this game")
        
        if game.data[0]["game_type"] != "individual":
            raise HTTPException(status_code=400, detail="This game is not an individual event")
        
        # Check if player already registered
        existing = supabase.table("individual_registrations").select("*").eq(
            "scheduled_game_id", registration.scheduled_game_id
        ).eq("player_name", registration.player_name).execute()
        
        if existing.data:
            raise HTTPException(status_code=400, detail="Player already registered")
        
        response = supabase.table("individual_registrations").insert({
            "scheduled_game_id": registration.scheduled_game_id,
            "player_name": registration.player_name,
            "phone": registration.phone,
            "email": registration.email,
            "age": registration.age
        }).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/individual-registrations/{registration_id}")
async def delete_individual_registration(registration_id: int):
    """Delete an individual registration"""
    try:
        response = supabase.table("individual_registrations").delete().eq("id", registration_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Registration not found")
        return {"message": "Individual registration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/active-games/list")
async def get_active_games_with_state():
    """Get all active games with their current state"""
    try:
        # Get active scheduled games
        games_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", True).execute()
        
        if not games_response.data:
            return []
        
        result = []
        for game in games_response.data:
            # Try to get existing state
            state_response = supabase.table("active_game_states").select("*").eq(
                "scheduled_game_id", game["id"]
            ).execute()
            
            game_data = {
                "id": game["id"],
                "game": game["games"],
                "scheduled_time": game["scheduled_time"],
                "date": game["date"],
                "venue": game["venue"],
                "game_type": game["game_type"],
                "status": "playing",
                "current_scores": {}
            }
            
            # If state exists, use it
            if state_response.data and len(state_response.data) > 0:
                game_data["current_scores"] = state_response.data[0]["current_scores"]
                game_data["status"] = state_response.data[0]["status"]
            else:
                # Initialize state based on game type
                if game["game_type"] == "team":
                    # Get team registrations
                    teams_response = supabase.table("team_registrations").select("*").eq(
                        "scheduled_game_id", game["id"]
                    ).execute()
                    
                    game_data["current_scores"] = {
                        "participants": [
                            {"name": team["team_name"], "score": 0}
                            for team in teams_response.data
                        ]
                    }
                else:
                    # Get individual registrations
                    players_response = supabase.table("individual_registrations").select("*").eq(
                        "scheduled_game_id", game["id"]
                    ).execute()
                    
                    game_data["current_scores"] = {
                        "participants": [
                            {"name": player["player_name"], "time": None}
                            for player in players_response.data
                        ]
                    }
            
            result.append(game_data)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/active-games/{scheduled_game_id}/update-score")
async def update_game_score(scheduled_game_id: int, update: ScoreUpdate):
    """Update score for a team game"""
    try:
        # Get current state
        state_response = supabase.table("active_game_states").select("*").eq(
            "scheduled_game_id", scheduled_game_id
        ).execute()
        
        if state_response.data and len(state_response.data) > 0:
            # Update existing state
            current_scores = state_response.data[0]["current_scores"]
            current_scores["participants"][update.participant_index]["score"] += update.score_change
            
            # Ensure score doesn't go below 0
            if current_scores["participants"][update.participant_index]["score"] < 0:
                current_scores["participants"][update.participant_index]["score"] = 0
            
            response = supabase.table("active_game_states").update({
                "current_scores": current_scores,
                "updated_at": datetime.now().isoformat()
            }).eq("id", state_response.data[0]["id"]).execute()
            
            return response.data[0]
        else:
            # Create new state
            game_response = supabase.table("scheduled_games").select("*").eq(
                "id", scheduled_game_id
            ).execute()
            
            if not game_response.data:
                raise HTTPException(status_code=404, detail="Game not found")
            
            # Get teams
            teams_response = supabase.table("team_registrations").select("*").eq(
                "scheduled_game_id", scheduled_game_id
            ).execute()
            
            current_scores = {
                "participants": [
                    {"name": team["team_name"], "score": 0}
                    for team in teams_response.data
                ]
            }
            
            # Apply the score change
            current_scores["participants"][update.participant_index]["score"] += update.score_change
            if current_scores["participants"][update.participant_index]["score"] < 0:
                current_scores["participants"][update.participant_index]["score"] = 0
            
            response = supabase.table("active_game_states").insert({
                "scheduled_game_id": scheduled_game_id,
                "current_scores": current_scores,
                "status": "playing"
            }).execute()
            
            return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/active-games/{scheduled_game_id}/update-time")
async def update_game_time(scheduled_game_id: int, update: TimeUpdate):
    """Update time for an individual game"""
    try:
        # Get current state
        state_response = supabase.table("active_game_states").select("*").eq(
            "scheduled_game_id", scheduled_game_id
        ).execute()
        
        if state_response.data and len(state_response.data) > 0:
            # Update existing state
            current_scores = state_response.data[0]["current_scores"]
            current_scores["participants"][update.participant_index]["time"] = update.time
            
            response = supabase.table("active_game_states").update({
                "current_scores": current_scores,
                "updated_at": datetime.now().isoformat()
            }).eq("id", state_response.data[0]["id"]).execute()
            
            return response.data[0]
        else:
            # Create new state
            game_response = supabase.table("scheduled_games").select("*").eq(
                "id", scheduled_game_id
            ).execute()
            
            if not game_response.data:
                raise HTTPException(status_code=404, detail="Game not found")
            
            # Get players
            players_response = supabase.table("individual_registrations").select("*").eq(
                "scheduled_game_id", scheduled_game_id
            ).execute()
            
            current_scores = {
                "participants": [
                    {"name": player["player_name"], "time": None}
                    for player in players_response.data
                ]
            }
            
            # Apply the time update
            current_scores["participants"][update.participant_index]["time"] = update.time
            
            response = supabase.table("active_game_states").insert({
                "scheduled_game_id": scheduled_game_id,
                "current_scores": current_scores,
                "status": "playing"
            }).execute()
            
            return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/active-games/{scheduled_game_id}/declare-winner")
async def declare_winner(scheduled_game_id: int, result: GameResult):
    """Declare winner and mark game as completed"""
    try:
        # Get current state
        state_response = supabase.table("active_game_states").select("*").eq(
            "scheduled_game_id", scheduled_game_id
        ).execute()
        
        winner_data = {
            "name": result.winner_name,
            "score": result.winner_score,
            "time": result.winner_time,
            "declared_at": datetime.now().isoformat()
        }
        
        if state_response.data and len(state_response.data) > 0:
            # Update existing state
            response = supabase.table("active_game_states").update({
                "status": "completed",
                "winner_data": winner_data,
                "updated_at": datetime.now().isoformat()
            }).eq("id", state_response.data[0]["id"]).execute()
        else:
            # Create new completed state
            response = supabase.table("active_game_states").insert({
                "scheduled_game_id": scheduled_game_id,
                "current_scores": {"participants": []},
                "status": "completed",
                "winner_data": winner_data
            }).execute()
        
        # Deactivate the game
        supabase.table("scheduled_games").update({
            "is_active": False
        }).eq("id", scheduled_game_id).execute()
        
        return {"message": "Winner declared successfully", "winner": winner_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/active-games/{scheduled_game_id}/state")
async def get_game_state(scheduled_game_id: int):
    """Get current state of a specific game"""
    try:
        state_response = supabase.table("active_game_states").select("*").eq(
            "scheduled_game_id", scheduled_game_id
        ).execute()
        
        if not state_response.data:
            raise HTTPException(status_code=404, detail="Game state not found")
        
        return state_response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/results")
async def get_all_results():
    """Get all completed games with results"""
    try:
        # Get all completed game states
        results_response = supabase.table("active_game_states").select(
            "*, scheduled_games(*, games(*))"
        ).eq("status", "completed").execute()
        
        if not results_response.data:
            return []
        
        formatted_results = []
        for result in results_response.data:
            game_data = result["scheduled_games"]
            
            formatted_result = {
                "id": result["id"],
                "scheduled_game_id": result["scheduled_game_id"],
                "game": game_data["games"],
                "date": game_data["date"],
                "venue": game_data["venue"],
                "game_type": game_data["game_type"],
                "winner_data": result["winner_data"],
                "current_scores": result["current_scores"],
                "completed_at": result["updated_at"]
            }
            
            # Format based on game type
            if game_data["game_type"] == "team":
                # For team events, show winner and runner-up
                participants = result["current_scores"].get("participants", [])
                sorted_participants = sorted(participants, key=lambda x: x.get("score", 0), reverse=True)
                
                formatted_result["winner"] = {
                    "name": sorted_participants[0]["name"] if len(sorted_participants) > 0 else "N/A",
                    "score": sorted_participants[0].get("score", 0) if len(sorted_participants) > 0 else 0
                }
                
                formatted_result["runner_up"] = {
                    "name": sorted_participants[1]["name"] if len(sorted_participants) > 1 else "N/A",
                    "score": sorted_participants[1].get("score", 0) if len(sorted_participants) > 1 else 0
                }
            else:
                # For individual events, show top 3 with medals
                participants = result["current_scores"].get("participants", [])
                # Filter participants with times and sort by time
                timed_participants = [p for p in participants if p.get("time")]
                sorted_participants = sorted(
                    timed_participants, 
                    key=lambda x: float(str(x.get("time", "999")).replace("s", ""))
                )
                
                results_list = []
                medals = ["gold", "silver", "bronze"]
                for idx, participant in enumerate(sorted_participants[:3]):
                    results_list.append({
                        "position": idx + 1,
                        "name": participant["name"],
                        "time": participant.get("time"),
                        "medal": medals[idx] if idx < 3 else None
                    })
                
                formatted_result["results"] = results_list
            
            formatted_results.append(formatted_result)
        
        # Sort by completion date, most recent first
        formatted_results.sort(key=lambda x: x["completed_at"], reverse=True)
        
        return formatted_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/category/{category}")
async def get_results_by_category(category: str):
    """Get completed games filtered by category"""
    try:
        # Get all completed game states with game info
        results_response = supabase.table("active_game_states").select(
            "*, scheduled_games(*, games(*))"
        ).eq("status", "completed").execute()
        
        if not results_response.data:
            return []
        
        # Filter by category if not 'all'
        filtered_results = []
        for result in results_response.data:
            game_category = result["scheduled_games"]["games"]["category"]
            if category == "all" or game_category == category:
                game_data = result["scheduled_games"]
                
                formatted_result = {
                    "id": result["id"],
                    "scheduled_game_id": result["scheduled_game_id"],
                    "game": game_data["games"],
                    "date": game_data["date"],
                    "venue": game_data["venue"],
                    "game_type": game_data["game_type"],
                    "winner_data": result["winner_data"],
                    "current_scores": result["current_scores"],
                    "completed_at": result["updated_at"]
                }
                
                # Format based on game type
                if game_data["game_type"] == "team":
                    participants = result["current_scores"].get("participants", [])
                    sorted_participants = sorted(participants, key=lambda x: x.get("score", 0), reverse=True)
                    
                    formatted_result["winner"] = {
                        "name": sorted_participants[0]["name"] if len(sorted_participants) > 0 else "N/A",
                        "score": sorted_participants[0].get("score", 0) if len(sorted_participants) > 0 else 0
                    }
                    
                    formatted_result["runner_up"] = {
                        "name": sorted_participants[1]["name"] if len(sorted_participants) > 1 else "N/A",
                        "score": sorted_participants[1].get("score", 0) if len(sorted_participants) > 1 else 0
                    }
                else:
                    participants = result["current_scores"].get("participants", [])
                    timed_participants = [p for p in participants if p.get("time")]
                    sorted_participants = sorted(
                        timed_participants, 
                        key=lambda x: float(str(x.get("time", "999")).replace("s", ""))
                    )
                    
                    results_list = []
                    medals = ["gold", "silver", "bronze"]
                    for idx, participant in enumerate(sorted_participants[:3]):
                        results_list.append({
                            "position": idx + 1,
                            "name": participant["name"],
                            "time": participant.get("time"),
                            "medal": medals[idx] if idx < 3 else None
                        })
                    
                    formatted_result["results"] = results_list
                
                filtered_results.append(formatted_result)
        
        # Sort by completion date
        filtered_results.sort(key=lambda x: x["completed_at"], reverse=True)
        
        return filtered_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{scheduled_game_id}")
async def get_result_by_id(scheduled_game_id: int):
    """Get result for a specific game"""
    try:
        result_response = supabase.table("active_game_states").select(
            "*, scheduled_games(*, games(*))"
        ).eq("scheduled_game_id", scheduled_game_id).eq("status", "completed").execute()
        
        if not result_response.data:
            raise HTTPException(status_code=404, detail="Result not found")
        
        result = result_response.data[0]
        game_data = result["scheduled_games"]
        
        formatted_result = {
            "id": result["id"],
            "scheduled_game_id": result["scheduled_game_id"],
            "game": game_data["games"],
            "date": game_data["date"],
            "venue": game_data["venue"],
            "game_type": game_data["game_type"],
            "winner_data": result["winner_data"],
            "current_scores": result["current_scores"],
            "completed_at": result["updated_at"]
        }
        
        # Format based on game type
        if game_data["game_type"] == "team":
            participants = result["current_scores"].get("participants", [])
            sorted_participants = sorted(participants, key=lambda x: x.get("score", 0), reverse=True)
            
            formatted_result["winner"] = {
                "name": sorted_participants[0]["name"] if len(sorted_participants) > 0 else "N/A",
                "score": sorted_participants[0].get("score", 0) if len(sorted_participants) > 0 else 0
            }
            
            formatted_result["runner_up"] = {
                "name": sorted_participants[1]["name"] if len(sorted_participants) > 1 else "N/A",
                "score": sorted_participants[1].get("score", 0) if len(sorted_participants) > 1 else 0
            }
            
            # Add all participants ranking
            formatted_result["all_participants"] = [
                {"name": p["name"], "score": p.get("score", 0), "rank": idx + 1}
                for idx, p in enumerate(sorted_participants)
            ]
        else:
            participants = result["current_scores"].get("participants", [])
            timed_participants = [p for p in participants if p.get("time")]
            sorted_participants = sorted(
                timed_participants, 
                key=lambda x: float(str(x.get("time", "999")).replace("s", ""))
            )
            
            results_list = []
            medals = ["gold", "silver", "bronze"]
            for idx, participant in enumerate(sorted_participants):
                results_list.append({
                    "position": idx + 1,
                    "name": participant["name"],
                    "time": participant.get("time"),
                    "medal": medals[idx] if idx < 3 else None
                })
            
            formatted_result["results"] = results_list
        
        return formatted_result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/stats")
async def get_results_statistics():
    """Get overall tournament statistics"""
    try:
        # Get all completed games
        results_response = supabase.table("active_game_states").select(
            "*, scheduled_games(*, games(*))"
        ).eq("status", "completed").execute()
        
        if not results_response.data:
            return {
                "total_games": 0,
                "team_events": 0,
                "individual_events": 0,
                "total_participants": 0,
                "by_category": {}
            }
        
        total_games = len(results_response.data)
        team_events = 0
        individual_events = 0
        total_participants = 0
        category_counts = {}
        
        for result in results_response.data:
            game_type = result["scheduled_games"]["game_type"]
            category = result["scheduled_games"]["games"]["category"]
            
            # Count by type
            if game_type == "team":
                team_events += 1
                total_participants += len(result["current_scores"].get("participants", []))
            else:
                individual_events += 1
                total_participants += len(result["current_scores"].get("participants", []))
            
            # Count by category
            if category not in category_counts:
                category_counts[category] = 0
            category_counts[category] += 1
        
        return {
            "total_games": total_games,
            "team_events": team_events,
            "individual_events": individual_events,
            "total_participants": total_participants,
            "by_category": category_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/live-games")
async def get_live_games():
    """Get all active games with live scores for public display"""
    try:
        # Get active scheduled games
        games_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", True).execute()
        
        if not games_response.data:
            return []
        
        result = []
        for game in games_response.data:
            # Get current game state
            state_response = supabase.table("active_game_states").select("*").eq(
                "scheduled_game_id", game["id"]
            ).execute()
            
            game_data = {
                "id": game["id"],
                "game": game["games"],
                "startTime": game["scheduled_time"],
                "date": game["date"],
                "venue": game["venue"],
                "gameType": game["game_type"],
                "status": "playing",
                "participants": []
            }
            
            # Get participants with current scores/times
            if state_response.data and len(state_response.data) > 0:
                current_scores = state_response.data[0]["current_scores"]
                game_data["participants"] = current_scores.get("participants", [])
            else:
                # If no state exists, initialize from registrations
                if game["game_type"] == "team":
                    teams_response = supabase.table("team_registrations").select("*").eq(
                        "scheduled_game_id", game["id"]
                    ).execute()
                    
                    game_data["participants"] = [
                        {"name": team["team_name"], "score": 0}
                        for team in teams_response.data
                    ]
                else:
                    players_response = supabase.table("individual_registrations").select("*").eq(
                        "scheduled_game_id", game["id"]
                    ).execute()
                    
                    game_data["participants"] = [
                        {"name": player["player_name"], "time": None}
                        for player in players_response.data
                    ]
            
            result.append(game_data)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/live-games/{scheduled_game_id}")
async def get_live_game_details(scheduled_game_id: int):
    """Get detailed information for a specific live game"""
    try:
        # Get scheduled game with game info
        game_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("id", scheduled_game_id).eq("is_active", True).execute()
        
        if not game_response.data:
            raise HTTPException(status_code=404, detail="Active game not found")
        
        game = game_response.data[0]
        
        # Get current game state
        state_response = supabase.table("active_game_states").select("*").eq(
            "scheduled_game_id", game["id"]
        ).execute()
        
        game_data = {
            "id": game["id"],
            "game": game["games"],
            "startTime": game["scheduled_time"],
            "date": game["date"],
            "venue": game["venue"],
            "gameType": game["game_type"],
            "status": "playing",
            "participants": [],
            "registrations": []
        }
        
        # Get participants with current scores/times
        if state_response.data and len(state_response.data) > 0:
            current_scores = state_response.data[0]["current_scores"]
            game_data["participants"] = current_scores.get("participants", [])
        
        # Get detailed registration info
        if game["game_type"] == "team":
            teams_response = supabase.table("team_registrations").select("*").eq(
                "scheduled_game_id", game["id"]
            ).execute()
            
            game_data["registrations"] = [
                {
                    "teamName": team["team_name"],
                    "captainName": team["captain_name"],
                    "captainPhone": team["captain_phone"],
                    "captainEmail": team["captain_email"],
                    "players": team["players"],
                    "registeredAt": team["registered_at"]
                }
                for team in teams_response.data
            ]
            
            # If no state exists, initialize from registrations
            if not game_data["participants"]:
                game_data["participants"] = [
                    {"name": team["team_name"], "score": 0}
                    for team in teams_response.data
                ]
        else:
            players_response = supabase.table("individual_registrations").select("*").eq(
                "scheduled_game_id", game["id"]
            ).execute()
            
            game_data["registrations"] = [
                {
                    "playerName": player["player_name"],
                    "phone": player["phone"],
                    "email": player["email"],
                    "age": player["age"],
                    "registeredAt": player["registered_at"]
                }
                for player in players_response.data
            ]
            
            # If no state exists, initialize from registrations
            if not game_data["participants"]:
                game_data["participants"] = [
                    {"name": player["player_name"], "time": None}
                    for player in players_response.data
                ]
        
        return game_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/dashboard/overview")
async def get_dashboard_overview():
    """Get complete dashboard overview statistics"""
    try:
        # Get all games
        games_response = supabase.table("games").select("*").execute()
        total_games = len(games_response.data)
        
        # Get active games
        active_games_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", True).execute()
        active_games_count = len(active_games_response.data)
        
        # Get pending games (scheduled but not active)
        pending_games_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", False).execute()
        pending_games_count = len(pending_games_response.data)
        
        # Get total participants (both team and individual)
        team_registrations = supabase.table("team_registrations").select("players").execute()
        total_team_players = sum(len(reg.get("players", [])) for reg in team_registrations.data)
        
        individual_registrations = supabase.table("individual_registrations").select("id").execute()
        total_individual_players = len(individual_registrations.data)
        
        total_participants = total_team_players + total_individual_players
        
        return {
            "total_games": total_games,
            "active_games_count": active_games_count,
            "pending_games_count": pending_games_count,
            "total_participants": total_participants
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/active-games")
async def get_dashboard_active_games():
    """Get active games for dashboard display"""
    try:
        # Get active scheduled games
        games_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", True).execute()
        
        if not games_response.data:
            return []
        
        result = []
        for game in games_response.data:
            # Get current game state
            state_response = supabase.table("active_game_states").select("*").eq(
                "scheduled_game_id", game["id"]
            ).execute()
            
            game_data = {
                "id": game["id"],
                "game": game["games"],
                "startTime": game["scheduled_time"],
                "status": "playing",
                "venue": game["venue"],
                "gameType": game["game_type"],
                "participants": [],
                "currentScore": ""
            }
            
            # Get participants and scores
            if state_response.data and len(state_response.data) > 0:
                current_scores = state_response.data[0]["current_scores"]
                participants = current_scores.get("participants", [])
                game_data["participants"] = [p["name"] for p in participants]
                
                # Format score display
                if game["game_type"] == "team":
                    score_parts = [f"{p['name']}: {p.get('score', 0)}" for p in participants]
                    game_data["currentScore"] = " - ".join(score_parts)
                else:
                    # For individual, show top 3 times
                    timed = [p for p in participants if p.get("time")]
                    sorted_timed = sorted(timed, key=lambda x: float(str(x.get("time", "999")).replace("s", "")))[:3]
                    score_parts = [f"{p['name']}: {p.get('time')}" for p in sorted_timed]
                    game_data["currentScore"] = ", ".join(score_parts) if score_parts else "In Progress"
            else:
                # If no state, get from registrations
                if game["game_type"] == "team":
                    teams_response = supabase.table("team_registrations").select("team_name").eq(
                        "scheduled_game_id", game["id"]
                    ).execute()
                    game_data["participants"] = [team["team_name"] for team in teams_response.data]
                    game_data["currentScore"] = "0 - 0"
                else:
                    players_response = supabase.table("individual_registrations").select("player_name").eq(
                        "scheduled_game_id", game["id"]
                    ).execute()
                    game_data["participants"] = [player["player_name"] for player in players_response.data]
                    game_data["currentScore"] = "In Progress"
            
            result.append(game_data)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/pending-games")
async def get_dashboard_pending_games():
    """Get pending (scheduled but not activated) games for dashboard"""
    try:
        # Get scheduled games that are not yet active
        games_response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("is_active", False).order("date", desc=False).order("scheduled_time", desc=False).execute()
        
        if not games_response.data:
            return []
        
        result = []
        for game in games_response.data:
            game_data = {
                "id": game["id"],
                "game": game["games"],
                "scheduledTime": game["scheduled_time"],
                "date": game["date"],
                "venue": game["venue"],
                "gameType": game["game_type"],
                "participants": [],
                "registrationOpen": game.get("registration_open", True),
                "maxTeams": game.get("max_teams"),
                "maxPlayersPerTeam": game.get("max_players_per_team")
            }
            
            # Get registered participants
            if game["game_type"] == "team":
                teams_response = supabase.table("team_registrations").select("team_name").eq(
                    "scheduled_game_id", game["id"]
                ).execute()
                game_data["participants"] = [team["team_name"] for team in teams_response.data]
                game_data["registeredCount"] = len(teams_response.data)
            else:
                players_response = supabase.table("individual_registrations").select("player_name").eq(
                    "scheduled_game_id", game["id"]
                ).execute()
                game_data["participants"] = [player["player_name"] for player in players_response.data]
                game_data["registeredCount"] = len(players_response.data)
            
            result.append(game_data)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/games-by-category/{category}")
async def get_games_by_category(category: str):
    """Get games filtered by category"""
    try:
        if category == "all":
            response = supabase.table("games").select("*").execute()
        else:
            response = supabase.table("games").select("*").eq("category", category).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/game-stats")
async def get_game_statistics():
    """Get detailed game statistics for dashboard"""
    try:
        # Total games by category
        games_response = supabase.table("games").select("category").execute()
        category_counts = {}
        for game in games_response.data:
            cat = game.get("category", "other")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        # Scheduled games status
        scheduled_response = supabase.table("scheduled_games").select("is_active").execute()
        active_count = sum(1 for g in scheduled_response.data if g.get("is_active"))
        pending_count = len(scheduled_response.data) - active_count
        
        # Completed games
        completed_response = supabase.table("active_game_states").select("id").eq(
            "status", "completed"
        ).execute()
        completed_count = len(completed_response.data)
        
        # Registration statistics
        team_reg_response = supabase.table("team_registrations").select("id, players").execute()
        individual_reg_response = supabase.table("individual_registrations").select("id").execute()
        
        total_teams = len(team_reg_response.data)
        total_team_players = sum(len(reg.get("players", [])) for reg in team_reg_response.data)
        total_individual_players = len(individual_reg_response.data)
        
        return {
            "games_by_category": category_counts,
            "scheduled_games": {
                "active": active_count,
                "pending": pending_count,
                "completed": completed_count,
                "total": len(scheduled_response.data)
            },
            "registrations": {
                "total_teams": total_teams,
                "total_team_players": total_team_players,
                "total_individual_players": total_individual_players,
                "total_participants": total_team_players + total_individual_players
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/team-registrations/all/{game_id}")
async def get_all_teams_for_game(game_id: int):
    """Get all registered teams for a base game (for league scheduling)"""
    try:
        # Get the base game (non-league game)
        base_game = supabase.table("scheduled_games").select("*").eq(
            "game_id", game_id
        ).eq("is_league", False).execute()
        
        if not base_game.data:
            return []
        
        # Get all teams from all instances of this game
        all_teams = []
        for game_instance in base_game.data:
            teams_response = supabase.table("team_registrations").select("*").eq(
                "scheduled_game_id", game_instance["id"]
            ).execute()
            all_teams.extend(teams_response.data)
        
        # Remove duplicates based on team name
        unique_teams = {team["team_name"]: team for team in all_teams}.values()
        return list(unique_teams)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduled-games/league", response_model=dict)
async def create_league_game(scheduled_game: ScheduledGameCreate, session = Depends(verify_admin_token)):
    """Create a league/tournament match between two specific teams"""
    try:
        # Validate that it's a team game
        game_response = supabase.table("games").select("*").eq("id", scheduled_game.game_id).execute()
        if not game_response.data:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # Validate teams exist if specified
        if scheduled_game.team1_id:
            team1 = supabase.table("team_registrations").select("*").eq("id", scheduled_game.team1_id).execute()
            if not team1.data:
                raise HTTPException(status_code=404, detail="Team 1 not found")
        
        if scheduled_game.team2_id:
            team2 = supabase.table("team_registrations").select("*").eq("id", scheduled_game.team2_id).execute()
            if not team2.data:
                raise HTTPException(status_code=404, detail="Team 2 not found")
        
        response = supabase.table("scheduled_games").insert({
            "game_id": scheduled_game.game_id,
            "scheduled_time": scheduled_game.scheduled_time,
            "date": scheduled_game.date,
            "venue": scheduled_game.venue,
            "participants": scheduled_game.participants,
            "game_type": "team",  # League games are always team-based
            "is_active": False,
            "registration_open": False,  # League games don't need open registration
            "max_teams": 2,  # Always 2 teams in league match
            "max_players_per_team": scheduled_game.max_players_per_team,
            "is_league": True,
            "league_stage": scheduled_game.league_stage,
            "team1_id": scheduled_game.team1_id,
            "team2_id": scheduled_game.team2_id,
            "parent_game_id": scheduled_game.parent_game_id
        }).execute()
        
        result = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("id", response.data[0]["id"]).execute()
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scheduled-games/league/{game_id}")
async def get_league_matches(game_id: int):
    """Get all league matches for a specific game"""
    try:
        response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("game_id", game_id).eq("is_league", True).order("date").order("scheduled_time").execute()
        
        # Fetch team details for each match
        for match in response.data:
            if match.get("team1_id"):
                team1 = supabase.table("team_registrations").select("*").eq("id", match["team1_id"]).execute()
                match["team1"] = team1.data[0] if team1.data else None
            
            if match.get("team2_id"):
                team2 = supabase.table("team_registrations").select("*").eq("id", match["team2_id"]).execute()
                match["team2"] = team2.data[0] if team2.data else None
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scheduled-games/league/stage/{league_stage}")
async def get_matches_by_stage(league_stage: str):
    """Get all matches for a specific league stage"""
    try:
        response = supabase.table("scheduled_games").select(
            "*, games(*)"
        ).eq("league_stage", league_stage).order("date").order("scheduled_time").execute()
        
        for match in response.data:
            if match.get("team1_id"):
                team1 = supabase.table("team_registrations").select("*").eq("id", match["team1_id"]).execute()
                match["team1"] = team1.data[0] if team1.data else None
            
            if match.get("team2_id"):
                team2 = supabase.table("team_registrations").select("*").eq("id", match["team2_id"]).execute()
                match["team2"] = team2.data[0] if team2.data else None
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduled-games/league/{parent_game_id}/next-stage")
async def create_next_stage_match(
    parent_game_id: int,
    next_stage: str,
    scheduled_time: str,
    date: str,
    venue: str,
    team1_id: Optional[int] = None,
    team2_id: Optional[int] = None,
    session = Depends(verify_admin_token)
):
    """Create next stage match based on parent game results"""
    try:
        # Get parent game
        parent = supabase.table("scheduled_games").select("*").eq("id", parent_game_id).execute()
        if not parent.data:
            raise HTTPException(status_code=404, detail="Parent game not found")
        
        parent_game = parent.data[0]
        
        response = supabase.table("scheduled_games").insert({
            "game_id": parent_game["game_id"],
            "scheduled_time": scheduled_time,
            "date": date,
            "venue": venue,
            "participants": [],
            "game_type": "team",
            "is_active": False,
            "registration_open": False,
            "max_teams": 2,
            "is_league": True,
            "league_stage": next_stage,
            "team1_id": team1_id,
            "team2_id": team2_id,
            "parent_game_id": parent_game_id
        }).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/team-registrations/{registration_id}/add-player")
async def add_player_to_team(registration_id: int, player: PlayerUpdate):
    """Add a player to an existing team"""
    try:
        # Get current team registration
        team_response = supabase.table("team_registrations").select("*").eq(
            "id", registration_id
        ).execute()
        
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team = team_response.data[0]
        
        # Check if player already exists
        if player.player_name in team["players"]:
            raise HTTPException(status_code=400, detail="Player already exists in this team")
        
        # Get the scheduled game to check max players limit
        game_response = supabase.table("scheduled_games").select("*").eq(
            "id", team["scheduled_game_id"]
        ).execute()
        
        if game_response.data:
            max_players = game_response.data[0].get("max_players_per_team")
            if max_players and len(team["players"]) >= max_players:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Maximum {max_players} players allowed per team"
                )
        
        # Add player to the list
        updated_players = team["players"] + [player.player_name]
        
        # Update team registration
        response = supabase.table("team_registrations").update({
            "players": updated_players
        }).eq("id", registration_id).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/team-registrations/{registration_id}/edit-player/{player_index}")
async def edit_player_in_team(registration_id: int, player_index: int, player: PlayerUpdate):
    """Edit a player's name in a team"""
    try:
        # Get current team registration
        team_response = supabase.table("team_registrations").select("*").eq(
            "id", registration_id
        ).execute()
        
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team = team_response.data[0]
        
        # Check if player index is valid
        if player_index < 0 or player_index >= len(team["players"]):
            raise HTTPException(status_code=400, detail="Invalid player index")
        
        # Check if new name already exists (excluding current player)
        current_players = team["players"].copy()
        current_players.pop(player_index)
        if player.player_name in current_players:
            raise HTTPException(status_code=400, detail="Player name already exists in this team")
        
        # Update player name
        updated_players = team["players"].copy()
        updated_players[player_index] = player.player_name
        
        # Update team registration
        response = supabase.table("team_registrations").update({
            "players": updated_players
        }).eq("id", registration_id).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/team-registrations/{registration_id}/delete-player/{player_index}")
async def delete_player_from_team(registration_id: int, player_index: int):
    """Delete a player from a team"""
    try:
        # Get current team registration
        team_response = supabase.table("team_registrations").select("*").eq(
            "id", registration_id
        ).execute()
        
        if not team_response.data:
            raise HTTPException(status_code=404, detail="Team not found")
        
        team = team_response.data[0]
        
        # Check if player index is valid
        if player_index < 0 or player_index >= len(team["players"]):
            raise HTTPException(status_code=400, detail="Invalid player index")
        
        # Ensure at least one player remains
        if len(team["players"]) <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last player. Team must have at least one player.")
        
        # Remove player
        updated_players = team["players"].copy()
        updated_players.pop(player_index)
        
        # Update team registration
        response = supabase.table("team_registrations").update({
            "players": updated_players
        }).eq("id", registration_id).execute()
        
        return {"message": "Player deleted successfully", "team": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))