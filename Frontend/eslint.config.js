INSERT INTO TextEncoderStream.etm_users (
    username,
    display_name,
    first_name,
    last_name,
    primary_email,
    status,
    user_type,
    auth_provider,
    password_hash,
    mfa_enabled,
    two_factor_enabled,
    email_verified,           
    email_verified_at,       
    created_at
) VALUES (
    'sristi',                          
    'Admin User',                      
    'Admin',                          
    'User',                            
    '0srsu7@gmail.com',              
    'ACTIVE',                          
    'ADMIN',                           
    'LOCAL',                          
   "password123",
    false,                            
    false,                                                         
    NOW()            
    
);