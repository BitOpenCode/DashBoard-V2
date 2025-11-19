-- SQL запрос для получения детальной информации о пользователе
-- Включает все транзакции и статистику по типам операций

SELECT
    -- PERSON
    p.id AS person_id,
    p.language_code AS person_language,
    p.wallet_address,
    p.hex_wallet_address,
    p.is_ecos_premium,
    p.ecos_premium_until,
    p.onbording_done,
    p.created_at AS person_created_at,
    p.updated_at AS person_updated_at,

    -- TG ACCOUNT
    t.tg_id,
    COALESCE(t.username, t.first_name, 'Unknown') AS username,
    t.first_name,
    t.last_name,
    t.language AS tg_language,
    t.is_premium AS tg_premium,
    t.photo_url AS tg_photo_url,
    t.created_at AS tg_created_at,
    t.updated_at AS tg_updated_at,

    -- PERSON LEVEL
    COALESCE(l.level, 0) AS level,
    COALESCE(l.effective_ths, '0') AS effective_ths,
    COALESCE(l.progress_cached, '0') AS progress_cached,
    l.updated_at AS level_updated_at,

    -- ASIC OWNERSHIP
    COALESCE(asics.total_asics, 0) AS total_asics,
    COALESCE(own.ownership_details, CAST('[]' AS jsonb)) AS ownership_details,

    -- CURRENT BALANCES
    COALESCE(b.total_balance, 0) AS total_balance,
    COALESCE(b.balance_by_asset, CAST('{}' AS jsonb)) AS balance_by_asset,

    -- ASSET METADATA (с заменой ECOScoin на XP)
    COALESCE(am.assets_metadata, CAST('{}' AS jsonb)) AS assets_metadata,

    -- BALANCE HISTORY SUMMARY
    COALESCE(h.history_summary, CAST('{}' AS jsonb)) AS balance_history,

    -- LAST TRANSACTION
    COALESCE(lt.last_transaction, CAST('{}' AS jsonb)) AS last_transaction,

    -- ALL TRANSACTIONS (все транзакции пользователя)
    COALESCE(bh_all.all_transactions, CAST('[]' AS jsonb)) AS all_transactions,

    -- TRANSACTIONS BY TYPE (статистика по типам операций)
    COALESCE(bh_stats.transactions_by_type, CAST('{}' AS jsonb)) AS transactions_by_type,

    -- MINING SUMMARY
    COALESCE(m.mining_summary, CAST('{}' AS jsonb)) AS mining_summary,
    COALESCE(lm.last_mining, CAST('{}' AS jsonb)) AS last_mining,

    -- CHECKIN SUMMARY
    COALESCE(c.checkin_summary, CAST('{}' AS jsonb)) AS checkin_summary,
    COALESCE(st.streak_summary, CAST('{}' AS jsonb)) AS streak_summary,
    COALESCE(pp.participation_summary, CAST('{}' AS jsonb)) AS participation_summary,

    -- POKE SUMMARY
    COALESCE(pe.poke_sent_count, 0) AS poke_sent_count,
    COALESCE(pe.poke_received_count, 0) AS poke_received_count,
    COALESCE(pr.poke_rewards, CAST('[]' AS jsonb)) AS poke_rewards,

    -- REFERRALS
    COALESCE(rf.total_referrals, 0) AS total_referrals,
    COALESCE(rf.referees, CAST('[]' AS jsonb)) AS referees,

    -- STORE ORDERS
    COALESCE(so.total_orders, 0) AS total_orders,
    COALESCE(so.total_points_spent, 0) AS total_points_spent,
    COALESCE(so.total_ton_spent, 0) AS total_ton_spent,
    COALESCE(so.orders, CAST('[]' AS jsonb)) AS orders

FROM person p

-- TG ACCOUNT
LEFT JOIN tg_account t ON t.person_id = p.id

-- PERSON LEVEL
LEFT JOIN person_level l ON CAST(l.person_id AS integer) = p.id

-- ASIC aggregation
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

-- Ownership details
LEFT JOIN (
    SELECT
        a.person_id,
        jsonb_agg(
            jsonb_build_object(
                'avatar_id', o.avatar_id,
                'equipment_id', o.equipment_id,
                'quantity', o.quantity,
                'created_at', o.created_at
            )
        ) AS ownership_details
    FROM ownership o
    JOIN avatar a ON a.id = o.avatar_id
    GROUP BY a.person_id
) AS own ON own.person_id = p.id

-- CURRENT BALANCES
LEFT JOIN (
    SELECT
        person_id,
        SUM(CAST(value AS numeric)) AS total_balance,
        jsonb_object_agg(CAST(asset_id AS text), CAST(value AS numeric)) AS balance_by_asset
    FROM balance
    GROUP BY person_id
) AS b ON b.person_id = p.id

-- ASSET METADATA (для замены ECOScoin на XP)
LEFT JOIN (
    SELECT
        a.person_id,
        jsonb_object_agg(
            CAST(a.asset_id AS text),
            jsonb_build_object(
                'asset_id', a.asset_id,
                'name', CASE WHEN asset.name = 'ECOScoin' THEN 'XP' ELSE asset.name END
            )
        ) AS assets_metadata
    FROM (
        SELECT DISTINCT person_id, asset_id
        FROM balance
    ) AS a
    JOIN asset ON asset.id = a.asset_id
    GROUP BY a.person_id
) AS am ON am.person_id = p.id

-- BALANCE HISTORY
LEFT JOIN (
    SELECT
        person_id,
        jsonb_build_object(
            'total_in', SUM(CASE WHEN CAST(operation_value AS numeric) > 0 THEN CAST(operation_value AS numeric) ELSE 0 END),
            'total_out', SUM(CASE WHEN CAST(operation_value AS numeric) < 0 THEN ABS(CAST(operation_value AS numeric)) ELSE 0 END),
            'net', SUM(CAST(operation_value AS numeric))
        ) AS history_summary
    FROM balance_history
    GROUP BY person_id
) AS h ON h.person_id = p.id

-- LAST TRANSACTION
LEFT JOIN (
    SELECT DISTINCT ON (bh.person_id)
        bh.person_id,
        jsonb_build_object(
            'asset_id', bh.asset_id,
            'value', bh.value,
            'operation_value', bh.operation_value,
            'operation_type', bh.operation_type,
            'created_at', bh.created_at
        ) AS last_transaction
    FROM balance_history bh
    ORDER BY bh.person_id, bh.created_at DESC
) AS lt ON lt.person_id = p.id

-- ALL TRANSACTIONS (все транзакции пользователя)
LEFT JOIN (
    SELECT
        person_id,
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'asset_id', asset_id,
                'value', value,
                'operation_value', operation_value,
                'operation_type', operation_type,
                'operation_id', operation_id,
                'created_at', created_at,
                'updated_at', updated_at
            )
            ORDER BY created_at DESC
        ) AS all_transactions
    FROM balance_history
    GROUP BY person_id
) AS bh_all ON bh_all.person_id = p.id

-- TRANSACTIONS BY TYPE (статистика по типам операций)
LEFT JOIN (
    SELECT
        person_id,
        jsonb_object_agg(
            operation_type,
            jsonb_build_object(
                'count', count,
                'total_value', total_value,
                'last_transaction_at', last_transaction_at
            )
        ) AS transactions_by_type
    FROM (
        SELECT
            person_id,
            operation_type,
            COUNT(*) AS count,
            SUM(CAST(operation_value AS numeric)) AS total_value,
            MAX(created_at) AS last_transaction_at
        FROM balance_history
        WHERE operation_type IS NOT NULL
        GROUP BY person_id, operation_type
    ) AS stats
    GROUP BY person_id
) AS bh_stats ON bh_stats.person_id = p.id

-- MINING SUMMARY
LEFT JOIN (
    SELECT
        person_id,
        jsonb_build_object(
            'total_effective_ths', SUM(CAST(effective_ths_snapshot AS numeric)),
            'total_energy_kwh', SUM(CAST(energy_spent_kwh AS numeric)),
            'total_estimated_btc', SUM(CAST(reward_btc_estimate AS numeric)),
            'sessions_count', COUNT(*)
        ) AS mining_summary
    FROM mining
    GROUP BY person_id
) AS m ON m.person_id = p.id

-- LAST MINING SESSION
LEFT JOIN (
    SELECT DISTINCT ON (person_id)
        person_id,
        jsonb_build_object(
            'id', id,
            'status', status,
            'effective_ths_snapshot', effective_ths_snapshot,
            'expected_end_at', expected_end_at,
            'energy_spent_kwh', energy_spent_kwh,
            'reward_btc_estimate', reward_btc_estimate,
            'claimed_at', claimed_at,
            'created_at', created_at
        ) AS last_mining
    FROM mining
    ORDER BY person_id, created_at DESC
) AS lm ON lm.person_id = p.id

-- CHECKIN SUMMARY
LEFT JOIN (
    SELECT
        person_id,
        jsonb_build_object(
            'total_checkins', COUNT(*),
            'last_checkin', MAX(date)
        ) AS checkin_summary
    FROM person_checkin
    GROUP BY person_id
) AS c ON c.person_id = p.id

-- STREAK SUMMARY
LEFT JOIN (
    SELECT
        person_id,
        jsonb_build_object(
            'streak', streak,
            'last_checkin_date', last_checkin_date
        ) AS streak_summary
    FROM person_streak
) AS st ON st.person_id = p.id

-- PARTICIPATION SUMMARY
LEFT JOIN (
    SELECT
        person_id,
        jsonb_build_object(
            'participation_days', COUNT(*),
            'last_participation', MAX(updated_at)
        ) AS participation_summary
    FROM person_participation
    GROUP BY person_id
) AS pp ON pp.person_id = p.id

-- POKE SUMMARY
LEFT JOIN (
    SELECT
        person_id,
        SUM(poke_sent_count) AS poke_sent_count,
        SUM(poke_received_count) AS poke_received_count
    FROM (
        SELECT from_user AS person_id, COUNT(*) AS poke_sent_count, 0 AS poke_received_count
        FROM poke_event
        GROUP BY from_user
        UNION ALL
        SELECT to_user AS person_id, 0 AS poke_sent_count, COUNT(*) AS poke_received_count
        FROM poke_event
        GROUP BY to_user
    ) AS combined
    GROUP BY person_id
) AS pe ON pe.person_id = p.id

-- POKE REWARDS
LEFT JOIN (
    SELECT
        "personId" AS person_id,
        jsonb_agg(
            jsonb_build_object(
                'reward_id', id,
                'amount', amount,
                'day', day,
                'createdAt', "createdAt"
            )
        ) AS poke_rewards
    FROM poke_reward
    GROUP BY "personId"
) AS pr ON pr.person_id = p.id

-- REFERRALS
LEFT JOIN (
    SELECT
        r.referrer_id AS person_id,
        COUNT(r.referee_id) AS total_referrals,
        jsonb_agg(
            jsonb_build_object(
                'referee_id', r.referee_id,
                'joined_at', r.joined_at
            )
            ORDER BY r.joined_at
        ) AS referees
    FROM referral r
    GROUP BY r.referrer_id
) AS rf ON rf.person_id = p.id

-- STORE ORDERS
LEFT JOIN (
    SELECT
        person_id,
        COUNT(*) AS total_orders,
        SUM(COALESCE(CAST(amount_points AS numeric),0)) AS total_points_spent,
        SUM(COALESCE(CAST(amount_ton AS numeric),0)) AS total_ton_spent,
        jsonb_agg(
            jsonb_build_object(
                'order_id', id,
                'item_code', item_code,
                'status', status,
                'amount_points', amount_points,
                'amount_ton', amount_ton,
                'metadata', metadata,
                'created_at', created_at,
                'updated_at', updated_at
            )
        ) AS orders
    FROM store_order
    GROUP BY person_id
) AS so ON so.person_id = p.id

-- Примечание: Для фильтрации по конкретному пользователю добавьте WHERE p.id = <person_id>
-- В n8n можно использовать: WHERE p.id = $1 или WHERE p.id = {{ $json.person_id }}
-- Или фильтровать результаты после выполнения запроса в n8n

