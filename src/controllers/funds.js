const Fund = require("../models/fund")

const createFund = async (req, res) => {
    try {
        const { title, content, deadline, targetFund, categories, address } = req.body
        const fund = await Fund.create({
            publisherId: req.user.id,
            title: title,
            content: content,
            deadline: deadline,
            targetFund: targetFund,
            categories: categories,
            address: {
                city: address.city,
                country: address.country,
                addressLine: address.addressLine
            },
        })
        res.status(201).json(fund)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

module.exports = {
    createFund
}
