const calculateDate = () => {
    const toPincode = parseInt(document.querySelector("#pincode").value)
    console.log(toPincode)
    if (toPincode>=600000 && toPincode <= 660000) {
        console.log(toPincode)
        const fromPincode = 600054
        const distance = Math.abs(fromPincode - toPincode)
        var days,fees
        if (distance >= 20000) {
            days = 10
            fees = 200
        } else if (distance >= 15000) {
            days = 8
            fees = 160
        } else if (distance >= 10000) {
            fees = 140
            days = 7
        } else if (distance >= 5000) {
            fees = 120
            days = 6
        } else if (distance >= 1000) {
            fees = 100
            days = 5
        } else {
            fees = 80
            days = 3
        }
        const delivery = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        document.querySelector(".deliveryDate").textContent = "Delivery by " + delivery.toDateString()
        const deliveryDetails = { date: delivery, fees }
        console.log(deliveryDetails)
    } else {
        document.querySelector(".deliveryDate").textContent = "Enter valid pincode"
    }
}

