-- Mise à jour de la fonction pour vérifier la limite de 3 favoris seulement pour les utilisateurs non-premium
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

-- Le trigger existant continuera à utiliser cette fonction mise à jour 