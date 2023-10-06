-- count trips (railml trains)
SELECT ad.route_type, count(distinct trip_id)
FROM (
SELECT *
FROM "db-gtfs".arrivals_departures 
where t_departure >= '2023-06-01T8:00+01' AND t_departure <= '2023-06-01T12:00+01'
and stop_sequence = 0 and route_type IN ('2', '100', '101', '102','103','106','109')
) AS ad
JOIN "db-gtfs".routes r on r.route_id = ad.route_id
JOIN "db-gtfs".agency ag on r.agency_id = ag.agency_id
where agency_name NOT LIKE '%bus%'
group by ad.route_type


-- count connections between station pairs
WITH ad AS (
SELECT *
FROM "db-gtfs".arrivals_departures 
where t_departure >= '2023-06-01T10:00+02' AND t_departure < '2023-06-01T18:00+02'
and route_type IN ('2', '100','103','106','109') --'101', '102'
)
SELECT ad1.stop_id, ad2.stop_id, COUNT(*)
FROM ad ad1
JOIN ad ad2 ON ad1.trip_id = ad2.trip_id AND ad1.stop_sequence+1 = ad2.stop_sequence
GROUP BY ad1.stop_id, ad2.stop_id


-- count departures for stations
WITH ad AS (
SELECT *
FROM "db-gtfs".arrivals_departures 
where t_departure >= '2023-06-01T10:00+02' AND t_departure < '2023-06-01T16:00+02'
and route_type IN ('2', '100','103','106','109') --'101', '102'
)
SELECT ad1.stop_id, COUNT(*)
FROM ad ad1
GROUP BY ad1.stop_id