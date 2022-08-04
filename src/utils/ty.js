if (address) {

    //converting shipping address to string them parsing it.
    /* let shippingAddressToString = JSON.stringify(address)
    let address = JSON.parse(shippingAddressToString) */

    if (validation.isValidRequestBody(address)) {
        if (address.hasOwnProperty('shipping')) {
            if (address.shipping.hasOwnProperty('street')) {
                if (!validation.isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's Street" });
                }
            }
            if (address.shipping.hasOwnProperty('city')) {
                if (!validation.isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's City" });
                }
            }
            if (address.shipping.hasOwnProperty('pincode')) {
                if (!validation.isValid(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's pincode" });
                }
            }

            //using var to use these variables outside this If block.
            var shippingStreet = address.shipping.street
            var shippingCity = address.shipping.city
            var shippingPincode = address.shipping.pincode
        }
    } else {
        return res.status(400).send({ status: false, message: " Invalid request parameters. Shipping address cannot be empty" });
    }
}
if (address) {

    //converting billing address to string them parsing it.
    /* let billingAddressToString = JSON.stringify(address)
    let address = JSON.parse(billingAddressToString) */

    if (validation.isValidRequestBody(address)) {
        if (address.hasOwnProperty('billing')) {
            if (address.billing.hasOwnProperty('street')) {
                if (!validation.isValid(address.billing.street)) {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's Street" });
                }
            }
            if (address.billing.hasOwnProperty('city')) {
                if (!validation.isValid(address.billing.city)) {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's City" });
                }
            }
            if (address.billing.hasOwnProperty('pincode')) {
                if (!validation.isValid(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's pincode" });
                }
            }

            //using var to use these variables outside this If block.
            var billingStreet = address.billing.street
            var billingCity = address.billing.city
            var billingPincode = address.billing.pincode
        }
    } else {
        return res.status(400).send({ status: false, message: " Invalid request parameters. Billing address cannot be empty" });
    }
}