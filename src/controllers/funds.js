const Fund = require("../models/fund")

const createFund = async (req, res) => {
    try {
        const fund = await Fund.create({
            publisherId: req.user.id,
            title: req.body.title,
            content: req.body.content,
            deadline: req.body.deadline,
            targetFund: req.body.targetFund,
            categories: req.body.categories,
            address: {
                city: req.body.city,
                country: req.body.country,
                addressLine: req.body.addressLine
            },
        })
        res.status(201).json(fund)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    createFund
}
 