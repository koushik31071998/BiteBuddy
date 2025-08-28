import CatalogService from "./catalog.class";
import { Request, Response } from "express";

export const createItem = async (req: Request, res: Response) => {

    try {
        const data = req.body;
        const response = await CatalogService.createItem(data);
        res.json(response).status(201);
    } catch (error: any) {
        res.status(500).json(error.message);
    }

}

export const getItems = async (req: Request, res: Response) => {
  try {
    const { page, limit, category, search } = req.query;
    const result = await CatalogService.getItems(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
      category as string,
      search as string
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const item = await CatalogService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const updated = await CatalogService.updateItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Item not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const deleted = await CatalogService.deleteItem(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};