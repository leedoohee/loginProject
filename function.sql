CREATE OR REPLACE FUNCTION combinations(anyarray) RETURNS SETOF anyarray AS $$
WITH RECURSIVE
    items AS (
            SELECT row_number() OVER (ORDER BY item) AS rownum, item
            FROM (SELECT unnest($1) AS item) unnested
    ),
    q AS (
            SELECT 1 AS i, $1[1:0] arr
            UNION ALL
            SELECT (i+1), CASE x
                    WHEN 1 THEN array_append(q.arr,(SELECT item FROM items WHERE rownum = i))
                    ELSE q.arr END
            FROM generate_series(0,1) x CROSS JOIN q WHERE i <= array_upper($1,1)
    )
SELECT q.arr AS mods
FROM q WHERE i = array_upper($1,1)+1;
$$ LANGUAGE 'sql';
