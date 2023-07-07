const db = require("../db"); // postrgres db
const { validateFields } = require("../utils/validate");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");

class LifeTrackerResourceModel {
    constructor() {

    }
    static async createNewResourceEntry(resourceType, entryData) {
        // creates new entry from a given resource type (nutrition, exercise, or others)

        const requiredFields = ["name", "category", "calories", "quantity", "userId"]
        try {
            validateFields({ required: requiredFields, obj: entryData, location: `new ${resourceType} entry` })
        } catch (err) {
            throw err
        }
        try {

            const result = await db.query(
                `
                INSERT INTO ` + resourceType.toLowerCase() +  ` (
                    user_id,
                    name,
                    category,
                    calories,
                    quantity,
                    created_at
                ) VALUES ($1, $2, $3, $4, $5, to_timestamp($6))
                RETURNING user_id AS "userId",
                          name,
                          category,
                          calories,
                          quantity,
                          id,
                          created_at AS "createdAt"
                `, [entryData.userId,
                entryData.name,
                entryData.category,
                entryData.calories,
                entryData.quantity,
                Date.now() / 1000,
            ]
            )
            return result.rows[0]
        } catch (error) {
            console.log("unable to uplaod entry to psql: ", error)
            throw error;
        }
    }
    static async fetchResourceEntryById(resourceType, entryID) {
        try{
            const result = await db.query(
                `SELECT * FROM ` + resourceType.toLowerCase() + ` WHERE id = $1`,
                [entryID.toLowerCase()]
            )
            return result.rows[0]
        }catch (error){
            console.log("unable to fetch resource: ", resourceType, "by id: ", entryID)
            throw error;
        }
    }
    static async listResourceEntriesForUser(resourceType, userId) {
        if (!userId) throw new BadRequestError("No userId was given");
        try{
            const result = await db.query(
                `SELECT * FROM ` + resourceType.toLowerCase() + ` WHERE user_id=$1 `
                , [userId]
            )
            return result.rows // returns list of nutrition objects
        }catch (error) {
            console.log("unable to fetch entries for resource type:", resourceType)
            throw error
        }
    }

}
module.exports = LifeTrackerResourceModel