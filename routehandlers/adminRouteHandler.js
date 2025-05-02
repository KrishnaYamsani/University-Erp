exports.allocatePreRegisteredCourses = async (req, res) => {
    try {
        // 1. Fetch all preregistrations ordered by preference
        const preregistrations = await pool.query(
            `SELECT student_id, course_offering_id
             FROM PreRegistration
             ORDER BY preference ASC`
        );

        const registered = new Set(); // student_id + offering_id

        for (let record of preregistrations.rows) {
            const { student_id, course_offering_id } = record;
            const key = `${student_id}-${course_offering_id}`;

            if (!registered.has(key)) {
                await pool.query(
                    `INSERT INTO Registration (student_id, course_offering_id, status)
                     VALUES ($1, $2, 'preregistered')`,
                    [student_id, course_offering_id]
                );
                registered.add(key);
            }
        }

        res.send("Pre-Registration Allocation Completed!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Allocation Error");
    }
};
