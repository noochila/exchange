
import { v4 as uuidv4, type UUIDTypes } from 'uuid';
import { orderbook, bookWithQuantity } from "./orderbook";

let GLOBAL_TRADE_ID = 0;

export const getOrderId = (): string => uuidv4();

interface Fill {
    "price": number,
    "qty": number,
    "tradeId": number,
}


export const fillOrder = (orderId: string, price: number, quantity: number, side: "buy" | "sell", type?: "ioc"): {
    status: "rejected" | "accepted";
    executedQty: number;
    fills: Fill[]
} => {

    const fills: Fill[] = [];
    const maxFillQuantity = getFillAmount(price, quantity, side); // 20
    let executedQty = 0;

    if (type === 'ioc' && maxFillQuantity < quantity) {
        return { status: 'rejected', executedQty: 0, fills: [] };
    }

    if (side === "buy") {
        orderbook.asks.sort((a, b) => a.price - b.price)
        orderbook.asks.forEach(o => {
            const filledQuantity = Math.min(quantity, o.quantity);
            if (o.price <= price && quantity > 0) {
                o.quantity -= filledQuantity;
                bookWithQuantity.asks[o.price] = (bookWithQuantity.asks[o.price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++
                })

                executedQty += filledQuantity;
                quantity -= filledQuantity;

                if (o.quantity === 0)
                    orderbook.asks.splice(orderbook.asks.indexOf(o), 1);

                if (bookWithQuantity.asks[price] === 0) {
                    delete bookWithQuantity.asks[price];
                }

            }
        })

        if (quantity !== 0) {
            orderbook.bids.push({
                price,
                quantity: quantity,
                side: 'bid',
                orderId
            });
            bookWithQuantity.bids[price] = (bookWithQuantity.bids[price] || 0) + quantity;
        }


    } else {

        orderbook.bids.sort((a,b)=>b.price-a.price)
        orderbook.bids.forEach(o => {
            const filledQuantity = Math.min(quantity, o.quantity);
            if (o.price >= price && quantity > 0) {
                o.quantity -= filledQuantity;
                bookWithQuantity.bids[o.price] = (bookWithQuantity.bids[o.price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++
                })

                executedQty += filledQuantity;
                quantity -= filledQuantity;

                if (o.quantity === 0)
                    orderbook.bids.splice(orderbook.bids.indexOf(o), 1);

                if (bookWithQuantity.bids[price] === 0) {
                    delete bookWithQuantity.bids[price];
                }

            }
        })

        if (quantity !== 0) {
            orderbook.asks.push({
                price,
                quantity: quantity,
                side: 'ask',
                orderId
            });
            bookWithQuantity.asks[price] = (bookWithQuantity.asks[price] || 0) + quantity;
        }

    }

    console.log("orderbook")
    console.log(orderbook)

    console.log("BookWithQuantity")
    console.log(bookWithQuantity)


    return {
        status: 'accepted',
        executedQty,
        fills
    }

}


function getFillAmount(price: number, quantity: number, side: "buy" | "sell"): number {
    let filled = 0;

    if (side === "buy") {
        orderbook.asks.forEach(o => {
            if (o.price <= price)
                filled += Math.min(quantity, o.quantity);
        })
    } else {
        orderbook.bids.forEach(o => {
            if (o.price >= price)
                filled += Math.min(quantity, o.quantity);

        })
    }
    return filled;
}