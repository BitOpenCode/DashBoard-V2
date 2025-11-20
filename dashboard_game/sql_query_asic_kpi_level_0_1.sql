-- SQL запрос для поиска пользователей, которым не хватает 1 ASIC для перехода на следующий уровень
-- Для уровней 0-1: уровень 0 требует 1 ASIC (234 Th), уровень 1 требует 4 ASIC (936 Th)
-- Ищем пользователей на уровне 0 с 3 ASIC (не хватает 1 для перехода на уровень 1)

-- Логика уровней:
-- 0 LVL: 234 Th = 1 ASIC
-- 1 LVL: 936 Th = 4 ASIC
-- 2 LVL: 4914 Th = 21 ASIC
-- 3 LVL: 14976 Th = 64 ASIC
-- 4 LVL: 24804 Th = 106 ASIC
-- 5 LVL: 49842 Th = 213 ASIC
-- 6 LVL: 99918 Th = 427 ASIC
-- 7 LVL: 249912 Th = 1068 ASIC
-- 8 LVL: 499824 Th = 2136 ASIC
-- 9 LVL: 999882 Th = 4273 ASIC
-- 10 LVL: 7999992 Th = 34188 ASIC (7999992 / 234 = 34188)

-- 1 ASIC = 234 Th

SELECT
    p.id AS person_id,
    COALESCE(t.tg_id, '') AS tg_id,
    COALESCE(t.username, t.first_name, 'Unknown') AS username,
    t.first_name,
    t.last_name,
    COALESCE(l.level, 0) AS current_level,
    COALESCE(l.effective_ths, '0') AS effective_ths,
    COALESCE(asics.total_asics, 0) AS total_asics,
    
    -- Определяем требуемое количество ASIC для следующего уровня
    CASE 
        WHEN COALESCE(l.level, 0) = 0 THEN 4  -- Для уровня 0 нужно 4 ASIC для уровня 1
        WHEN COALESCE(l.level, 0) = 1 THEN 21  -- Для уровня 1 нужно 21 ASIC для уровня 2
        WHEN COALESCE(l.level, 0) = 2 THEN 64  -- Для уровня 2 нужно 64 ASIC для уровня 3
        WHEN COALESCE(l.level, 0) = 3 THEN 106  -- Для уровня 3 нужно 106 ASIC для уровня 4
        WHEN COALESCE(l.level, 0) = 4 THEN 213  -- Для уровня 4 нужно 213 ASIC для уровня 5
        WHEN COALESCE(l.level, 0) = 5 THEN 427  -- Для уровня 5 нужно 427 ASIC для уровня 6
        WHEN COALESCE(l.level, 0) = 6 THEN 1068  -- Для уровня 6 нужно 1068 ASIC для уровня 7
        WHEN COALESCE(l.level, 0) = 7 THEN 2136  -- Для уровня 7 нужно 2136 ASIC для уровня 8
        WHEN COALESCE(l.level, 0) = 8 THEN 4273  -- Для уровня 8 нужно 4273 ASIC для уровня 9
        WHEN COALESCE(l.level, 0) = 9 THEN 34188  -- Для уровня 9 нужно 34188 ASIC для уровня 10
        ELSE NULL
    END AS required_asics_for_next_level,
    
    -- Вычисляем, сколько ASIC не хватает
    CASE 
        WHEN COALESCE(l.level, 0) = 0 THEN 4 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 1 THEN 21 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 2 THEN 64 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 3 THEN 106 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 4 THEN 213 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 5 THEN 427 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 6 THEN 1068 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 7 THEN 2136 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 8 THEN 4273 - COALESCE(asics.total_asics, 0)
        WHEN COALESCE(l.level, 0) = 9 THEN 34188 - COALESCE(asics.total_asics, 0)
        ELSE NULL
    END AS missing_asics,
    
    -- Текущий прогресс в процентах
    CASE 
        WHEN COALESCE(l.level, 0) = 0 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 4.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 1 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 21.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 2 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 64.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 3 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 106.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 4 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 213.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 5 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 427.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 6 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 1068.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 7 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 2136.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 8 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 4273.0) * 100, 2)
        WHEN COALESCE(l.level, 0) = 9 THEN 
            ROUND((COALESCE(asics.total_asics, 0)::numeric / 34188.0) * 100, 2)
        ELSE NULL
    END AS progress_percent,
    
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
    -- Фильтр: ищем пользователей, которым не хватает ровно 1 ASIC для перехода на следующий уровень
    (
        -- Уровень 0: нужно 4 ASIC, есть 3 (не хватает 1)
        (COALESCE(l.level, 0) = 0 AND COALESCE(asics.total_asics, 0) = 3)
        OR
        -- Уровень 1: нужно 21 ASIC, есть 20 (не хватает 1)
        (COALESCE(l.level, 0) = 1 AND COALESCE(asics.total_asics, 0) = 20)
        OR
        -- Уровень 2: нужно 64 ASIC, есть 63 (не хватает 1)
        (COALESCE(l.level, 0) = 2 AND COALESCE(asics.total_asics, 0) = 63)
        OR
        -- Уровень 3: нужно 106 ASIC, есть 105 (не хватает 1)
        (COALESCE(l.level, 0) = 3 AND COALESCE(asics.total_asics, 0) = 105)
        OR
        -- Уровень 4: нужно 213 ASIC, есть 212 (не хватает 1)
        (COALESCE(l.level, 0) = 4 AND COALESCE(asics.total_asics, 0) = 212)
        OR
        -- Уровень 5: нужно 427 ASIC, есть 426 (не хватает 1)
        (COALESCE(l.level, 0) = 5 AND COALESCE(asics.total_asics, 0) = 426)
        OR
        -- Уровень 6: нужно 1068 ASIC, есть 1067 (не хватает 1)
        (COALESCE(l.level, 0) = 6 AND COALESCE(asics.total_asics, 0) = 1067)
        OR
        -- Уровень 7: нужно 2136 ASIC, есть 2135 (не хватает 1)
        (COALESCE(l.level, 0) = 7 AND COALESCE(asics.total_asics, 0) = 2135)
        OR
        -- Уровень 8: нужно 4273 ASIC, есть 4272 (не хватает 1)
        (COALESCE(l.level, 0) = 8 AND COALESCE(asics.total_asics, 0) = 4272)
        OR
        -- Уровень 9: нужно 34188 ASIC для уровня 10, есть 34187 (не хватает 1)
        (COALESCE(l.level, 0) = 9 AND COALESCE(asics.total_asics, 0) = 34187)
    )

ORDER BY 
    COALESCE(l.level, 0) ASC,
    COALESCE(asics.total_asics, 0) DESC;

