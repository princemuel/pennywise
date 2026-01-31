SELECT "variant",
  CAST("checked_out" AS FLOAT) / CAST("opened" AS FLOAT) AS "conversion"
FROM (
    SELECT "variant",
      COUNT(
        CASE
          WHEN "type" = 'PageOpened' THEN 1
        END
      ) AS "opened",
      COUNT(
        CASE
          WHEN "type" = 'CheckedOut' THEN 1
        END
      ) AS "checked_out"
    FROM "TrackingEvent"
    WHERE "version" = $1
    GROUP BY "variant"
  ) AS "counts"
ORDER BY "conversion" DESC
