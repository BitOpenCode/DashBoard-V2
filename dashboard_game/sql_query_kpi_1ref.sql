-- SQL запрос для поиска всех пользователей, которые еще никого не пригласили
-- Возвращает всех пользователей с total_referrals = 0
-- Фильтрация по уровню выполняется на фронтенде

SELECT
    p.id AS person_id,
    COALESCE(t.tg_id, '') AS tg_id,
    COALESCE(t.username, t.first_name, 'Unknown') AS username,
    t.first_name,
    t.last_name,
    COALESCE(l.level, 0) AS current_level,
    COALESCE(l.effective_ths, '0') AS effective_ths,
    COALESCE(asics.total_asics, 0) AS total_asics,
    0 AS total_referrals,  -- Все пользователи в этом запросе имеют 0 рефералов
    p.created_at AS person_created_at,
    t.photo_url AS tg_photo_url

FROM person p

-- TG ACCOUNT
LEFT JOIN tg_account t ON t.person_id = p.id

-- PERSON LEVEL
LEFT JOIN person_level l ON CAST(l.person_id AS integer) = p.id

-- ASIC COUNT (подсчет количества ASIC у пользователя)
LEFT JOIN (
    SELECT
        p2.id AS person_id,
        SUM(o.quantity) AS total_asics
    FROM person p2
    JOIN avatar a ON a.person_id = p2.id
    JOIN ownership o ON o.avatar_id = a.id
    JOIN equipment e ON e.id = o.equipment_id
    WHERE e.name = 'ASIC'
    GROUP BY p2.id
) AS asics ON asics.person_id = p.id

WHERE 
    -- Фильтр: пользователи, которые еще никого не пригласили
    -- Проверяем, что пользователя нет в таблице referral как referrer_id
    p.id NOT IN (
        SELECT DISTINCT referrer_id 
        FROM referral 
        WHERE referrer_id IS NOT NULL
    )

ORDER BY 
    p.created_at DESC;

