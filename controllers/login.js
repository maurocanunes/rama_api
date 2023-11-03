/**
 * 
 * @param {*} pg 
 * @returns user[0]
 * 
 * @description it selects and check the login 
 * then if successfull it selects the user related to that
 * then it inserts into the table users_log using the user id
 */
const handleSignIn = (pg) => (req, res) => {
    const { email, password } = req.body;
    let user_id;
    if (!email || !password) {
        return res.status(400).json('incorrect form submission');
    }
    pg.transaction(trx => {
        trx.select()
        .from('users_login')
        .where('email', '=', email)
        .then(data => {
            if(data[0].email === email) {
                return trx.select()
                .from('users')
                .where('email', '=', email)
                .then(user => {
                    trx.insert({
                        user_id: user[0].id,
                        log: new Date()
                    })
                    .into('users_log')
                    .returning('*')
                    .then(log => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to set log'))
                })
                .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong credentials');
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json('Wrong Credentials')
    });
}

const handleRegister = (pg) => (req, res) => {
    const { email, password, name, birth } = req.body;
    if (!email || !password || !birth || !name) {
        return res.status(400).json('incorrect form submission');
    }
    pg.transaction(trx => {
        trx.insert({
            email: email,
            register_on: new Date(),
            password: password
        })
        .into('users_login')
        .returning('email')
        .then(user_email => {
            return trx('users')
            .returning('*')
            .insert({
                name: name,
                email: user_email[0].email,
                birth: birth
            }).then(user => {
                return trx('users_log')
                .returning('*')
                .insert({
                    user_id: user[0].id,
                    log: new Date()
                }).then(log => {
                    res.send(user[0]);
                })
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('error registering');
    })
}

module.exports = {
    handleSignIn: handleSignIn,
    handleRegister: handleRegister
}