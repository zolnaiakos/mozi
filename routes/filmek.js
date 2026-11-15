import pool from '../data/db.js'
import { Router } from 'express'

const router = Router()


router.get('/', async(req,res)=>{
    let sql = `
    SELECT f.id, f.cim, f.hossz, f.korhatar, COUNT(DISTINCT v.id) AS vetitesDb, COUNT(c.id) AS eladottJegy
    FROM filmek f    
    LEFT JOIN vetitesek v ON v.film_id = f.id
    LEFT JOIN foglalasok c ON c.vetites_id = v.id
    GROUP BY f.id, f.cim, f.hossz, f.korhatar
    ORDER BY f.id ASC
`
    const [eredmeny] = await pool.query(sql)

    res.json(eredmeny)
})

router.get('/:id', async(req,res)=>{

    //javitani kell hibas a helyko
    const {id} = req.params

    let sql = `
      SELECT f.id AS filmId, f.cim, f.hossz, f.korhatar, t.id AS teremId, t.nev AS terem, DATE_FORMAT(v.kezdes, '%Y-%m-%d %H:%i') AS kezdes, v.jegyar,
        (t.sorok * t.szekek) - (
            SELECT COUNT(*)
            FROM foglalasok c
            WHERE c.vetites_id = v.id
        ) AS szabadHely
    FROM filmek f
    LEFT JOIN vetitesek v ON v.film_id = f.id
    LEFT JOIN termek t ON t.id = v.terem_id
    WHERE f.id = ?
`   

    const [eredmeny] = await pool.query(sql,[id])

    if (!Number.isInteger(Number(id)) ||Number(id) <= 0){
        return res.status(400).json({error: "Az id csak szám lehet"})
    }

    if (eredmeny.length === 0) {
    return res.status(404).json({ error: "A film nem található" })
    }   

    const filmek = {
        id: eredmeny[0].id,
        cim : eredmeny [0].cim,
        hossz: eredmeny[0].hossz,
        korhatar: eredmeny[0].korhatar,
        vetitesek: []
    }
    
    eredmeny.forEach(vetitesek=>{
        filmek.vetitesek.push({
            teremId: vetitesek.teremId,
            terem: vetitesek.terem,
            kezdes: vetitesek.kezdes,
            jegyar: vetitesek.jegyar,
            ferohely: vetitesek.ferohely
        })
    })

    res.json(filmek)
    
})

export default router