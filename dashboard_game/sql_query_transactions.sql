-- Упрощенный SQL запрос для webhook game-transactions
-- Возвращает только транзакции и заказы для конкретного пользователя
-- Принимает параметр person_id через n8n

SELECT
    p.id AS person_id,
    
    -- ALL TRANSACTIONS (все транзакции пользователя)
    COALESCE(bh_all.all_transactions, CAST('[]' AS jsonb)) AS all_transactions,
    
    -- TRANSACTIONS BY TYPE (статистика по типам операций)
    COALESCE(bh_stats.transactions_by_type, CAST('{}' AS jsonb)) AS transactions_by_type,
    
    -- BALANCE HISTORY SUMMARY (для контекста)
    COALESCE(h.history_summary, CAST('{}' AS jsonb)) AS balance_history,
    
    -- LAST TRANSACTION
    COALESCE(lt.last_transaction, CAST('{}' AS jsonb)) AS last_transaction,
    
    -- STORE ORDERS (все заказы пользователя)
    COALESCE(so.total_orders, 0) AS total_orders,
    COALESCE(so.total_points_spent, 0) AS total_points_spent,
    COALESCE(so.total_ton_spent, 0) AS total_ton_spent,
    COALESCE(so.orders, CAST('[]' AS jsonb)) AS orders,
    
    -- ASSET METADATA (для отображения названий активов)
    COALESCE(am.assets_metadata, CAST('{}' AS jsonb)) AS assets_metadata

FROM person p

-- ALL TRANSACTIONS (все транзакции конкретного пользователя)
-- Теперь запрос фильтруется по person_id, поэтому можно вернуть все транзакции
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

-- BALANCE HISTORY SUMMARY
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

-- STORE ORDERS (все заказы конкретного пользователя)
-- Теперь запрос фильтруется по person_id, поэтому можно вернуть все заказы
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
            ORDER BY created_at DESC
        ) AS orders
    FROM store_order
    GROUP BY person_id
) AS so ON so.person_id = p.id

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
        FROM balance_history
    ) AS a
    JOIN asset ON asset.id = a.asset_id
    GROUP BY a.person_id
) AS am ON am.person_id = p.id

-- Фильтр по конкретному пользователю
-- person_id приходит из query параметра webhook (?person_id=10)
WHERE p.id = CAST({{ $json.query.person_id }} AS integer)

