const handleGetJobById = (pg) => (req, res) => {
    const { id } = req.params;
    pg.select('*').from('jobs').where({id})
    .then(job => {
        if (job.length) {
            return res.json(job[0]);
        } else {
            res.status(400).json('no such job')
        }
    })
    .catch(err => res.status(400).json('error getting job'))
}

const handleGetJobList = (pg) => (req, res) => {
    pg.select('*').from('jobs')
    .then(jobs => {
        return res.json(jobs);
    })
    .catch(err => res.status(400).json('error getting jobs list'))
}

const handleInsertJob = (pg) => (req, res) => {
    const { title, description, user_id } = req.body;

    if (!title || !description || !user_id) {
        return res.status(400).json('incorrect form submition')
    }

    pg.transaction(trx => {
        trx.insert({
            title: title,
            description: description,
            user_id: user_id,
            created_on: new Date()
        })
        .into('jobs')
        .returning('*')
        .then(job => {
            res.send(job[0])
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('error inserting job');
    })
}

module.exports = {
    handleGetJobById: handleGetJobById,
    handleGetJobList: handleGetJobList,
    handleInsertJob: handleInsertJob
}