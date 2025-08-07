-- Création de la table favorites
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    weather_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, city)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_city ON favorites(city);

-- Fonction pour vérifier la limite de 3 favoris seulement pour les utilisateurs non-premium
CREATE OR REPLACE FUNCTION check_favorites_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'utilisateur est premium
    IF (SELECT premium FROM users WHERE id = NEW.user_id) = false THEN
        -- Compter les favoris existants pour cet utilisateur non-premium
        IF (SELECT COUNT(*) FROM favorites WHERE user_id = NEW.user_id) >= 3 THEN
            RAISE EXCEPTION 'Limite de 3 favoris atteinte pour cet utilisateur non-premium';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appliquer la limite
DROP TRIGGER IF EXISTS trigger_check_favorites_limit ON favorites;
CREATE TRIGGER trigger_check_favorites_limit
    BEFORE INSERT ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION check_favorites_limit(); 