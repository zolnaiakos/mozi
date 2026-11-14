import pool from "../data/db.js";
import { Router } from "express";

const router = Router();

router.get('/', async(req,res)=>{
    const datum = req.query.datum

    //a szabadhelyek megírásához ai segítségét kértem

    let sql = `
    SELECT v.id, f.cim AS film, t.nev AS terem, DATE_FORMAT(v.kezdes, '%Y-%m-%d %H:%i') AS kezdes, DATE_FORMAT(DATE_ADD(v.kezdes, INTERVAL f.hossz MINUTE),'%H:%i') AS veg, v.jegyar, (t.sorok  * t.szekek)- (
    SELECT COUNT(*)
    FROM foglalasok c
    WHERE c.vetites_id = v.id
) AS szabadHely
    FROM vetitesek v    
    LEFT JOIN filmek f ON f.id = v.film_id
    LEFT JOIN termek t ON  t.id = v.terem_id
`

    const params = []

    if(datum){
        sql += ' WHERE DATE(v.kezdes) = ?'
        params.push(datum)
    }

    const [eredmeny] = await pool.query(sql,params)

    res.json(eredmeny)
})

export default router