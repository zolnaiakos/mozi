import express from 'express';
import pool from '../data/db.js'
import { Router } from 'express'

const router = express.Router()


//feladat megoldásához AI segítsége volt használva
router.post('/', async(req,res)=>{

    const {vetitesId, nev, sor, szek} = req.body

    if (!Number.isInteger(Number(vetitesId)) || Number(vetitesId) < 1) {
        return res.status(400).json({
            error: "Hibás vetítés azonosító"
        })
    }

    const [vetites] = await pool.query(`
        SELECT v.id, f.cim AS film, t.nev AS terem,
               v.kezdes, v.jegyar, t.sorok, t.szekek
        FROM vetitesek v
        LEFT JOIN filmek f ON f.id = v.film_id
        LEFT JOIN termek t ON t.id = v.terem_id
        WHERE v.id = ?
    `, [vetitesId])

    if (vetites.length === 0) {
        return res.status(404).json({
            error: "A vetítés nem található"
        })
    }

        let hibak = []

    if (!nev || nev.trim() === "") {
        hibak.push("A név megadása kötelező")
    }

    if (!Number.isInteger(Number(sor)) || Number(sor) < 1) {
        hibak.push("A sor érvénytelen")
    }

    if (!Number.isInteger(Number(szek)) || Number(szek) < 1) {
        hibak.push("A szék érvénytelen")
    }

    if (hibak.length > 0) {
        return res.status(400).json(hibak)
    }

    const terem = vetites[0]


    if (Number(sor) > terem.sorok || Number(szek) > terem.szekek) {
        return res.status(400).json({
            error: "A megadott hely nem létezik a teremben"
        })
    }

     const [foglaltDb] = await pool.query(`
        SELECT COUNT(*) AS db
        FROM foglalasok
        WHERE vetites_id = ?
    `, [vetitesId])

    const ferohely = terem.sorok * terem.szekek

    if (foglaltDb[0].db >= ferohely) {
        return res.status(409).json({
            error: `Telt ház:`
        })
    }

    const [foglalt] = await pool.query(`
        SELECT id
        FROM foglalasok
        WHERE vetites_id = ? AND sor = ? AND szek = ?
    `, [vetitesId, sor, szek])

    if (foglalt.length > 0) {
        return res.status(409).json({
            error: "A hely már foglalt"
        })
    }
     const [ujFoglalas] = await pool.query(`
        INSERT INTO foglalasok (vetites_id, nev, sor, szek)
        VALUES (?, ?, ?, ?)
    `, [vetitesId, nev.trim(), sor, szek])

     res.status(201).json({
        id: ujFoglalas.insertId,
        film: terem.film,
        terem: terem.terem,
        kezdes: terem.kezdes,
        nev: nev.trim(),
        sor: Number(sor),
        szek: Number(szek),
        jegyar: terem.jegyar
    })

})

router.delete('/:id', async(req,res)=>{
    const { id } = req.params

     const [eredmeny] = await pool.query(`
        SELECT * FROM foglalasok
        WHERE id = ?
    `, [id])

    if (eredmeny.length === 0) {
        return res.status(404).json({
            error: "A foglalás nem található"
        })
    }

    await pool.query(`
        DELETE FROM foglalasok
        WHERE id = ?
    `, [id])

    res.status(204).send()

})

export default router