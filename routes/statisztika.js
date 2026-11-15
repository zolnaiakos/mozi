import pool  from "../data/db.js";
import { Router } from "express";

const router = Router()

//sql lekérdezés nagyrésze Ai generált
router.get('/filmek', async(req,res)=>{
    let sql = `
    SELECT f.cim AS film, COALESCE(e.eladottJegy, 0) AS eladottJegy, COALESCE(e.bevetel, 0) AS bevetel,CASE
            WHEN k.kapacitas IS NULL OR k.kapacitas = 0 THEN NULL
            ELSE ROUND(
                COALESCE(e.eladottJegy, 0) / k.kapacitas * 100,
                1
            )
        END AS telitettseg
    FROM filmek f
    LEFT JOIN(
        SELECT
            v.film_id,
            COUNT(c.id) AS eladottJegy,
            SUM(v.jegyar) AS bevetel
        FROM vetitesek v
        LEFT JOIN foglalasok c ON c.vetites_id = v.id
        GROUP BY v.film_id
    ) e ON e.film_id = f.id
    LEFT JOIN (
        SELECT
            v.film_id,
            SUM(t.sorok * t.szekek) AS kapacitas
        FROM vetitesek v
        LEFT JOIN termek t ON t.id = v.terem_id
        GROUP BY v.film_id
    ) k ON k.film_id = f.id
    ORDER BY bevetel DESC, f.cim ASC    
`

    const [eredmeny] = await pool.query(sql)

    res.json(eredmeny)

})

export default router