import { Router } from "express";
import type { Request, Response } from "express";
import { OrderInputSchema } from "../types/zod";
import { getOrderId } from "../fill";
import { fillOrder } from "../fill";



const BASE_ASSET = 'BTC';
const QUOTE_ASSET = 'USD';

export const orderbookRouter: Router = Router();

// POST /api/v1/order - Place an order. Returns orderId and fill status
orderbookRouter.post("/order", (req: Request, res: Response) => {
    const order = OrderInputSchema.safeParse(req.body);

    if (!order.success) {
        res.status(400).send(order.error.message);
        return;
    }

    const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;
    const orderId = getOrderId();

    if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
        res.status(400).send('Invalid base or quote asset');
        return;
    }

    const { executedQty, fills } = fillOrder(orderId, price, quantity, side, kind);

    res.send({
        orderId,
        executedQty,
        fills
    });

});

// GET /api/v1/order/:orderId - Returns fill status
orderbookRouter.get("/order/:orderId", (req: Request, res: Response) => {

});
