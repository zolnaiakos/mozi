import pool from "../data/db.js";
import { Router } from "express";

const router = Router();

router.get('/', async(req,res)=>{
    const datum = req.query.datum

    if (datum) {
    const d = new Date(datum)

    if (
        isNaN(d.getTime()) ||
        d.toISOString().slice(0, 10) !== datum
    ) {
        return res.status(400).json({
            error: "Érvénytelen dátum"
        })
    }
}
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


router.get('/:id', async(req,res)=>{
    const {id} = req.params

    //Kellet AI segítsége
    let sql = `
    SELECT v.id, f.cim AS film, DATE_FORMAT(v.kezdes, '%Y-%m-%d %H:%i') AS kezdes, v.jegyar, t.sorok, t.szekek,
    (SELECT COUNT(*)
    FROM foglalasok c
    WHERE c.vetites_id = v.id) AS foglaltDb,
    (t.sorok * t.szekek) -
    (SELECT COUNT(*)
    FROM foglalasok c
    WHERE c.vetites_id = v.id) AS szabadHely
    FROM vetitesek v
    LEFT JOIN filmek f ON f.id = v.film_id
    LEFT JOIN termek t ON t.id = v.terem_id
    WHERE v.id = ?
`
    const [eredmeny] = await pool.query(sql,[id])

      if (eredmeny.length === 0) {
        return res.status(404).json({
            error: "A vetítés nem található"
        })
    }

    const [foglalt] = await pool.query(`
        SELECT sor, szek
        FROM foglalasok
        WHERE vetites_id = ?
        ORDER BY sor ASC, szek ASC
    `, [id])

     const vetites = {
        id: eredmeny[0].id,
        film: eredmeny[0].film,
        terem: eredmeny[0].terem,
        kezdes: eredmeny[0].kezdes,
        jegyar: eredmeny[0].jegyar,
        sorok: eredmeny[0].sorok,
        szekek: eredmeny[0].szekek,
        foglaltDb: eredmeny[0].foglaltDb,
        szabadHely: eredmeny[0].szabadHely,
        foglalt: foglalt
    }

    res.json(vetites)
    
})

export default router