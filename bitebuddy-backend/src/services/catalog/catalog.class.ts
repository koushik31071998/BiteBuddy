import Catalog, { ICatalog } from './catalog.schema';

export default class CatalogService {
  static async createItem(data: Partial<ICatalog>) {
    return await Catalog.create(data);
  }

  static async getItems(page = 1, limit = 10, category?: string, search?: string) {
    const query: any = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const items = await Catalog.find(query).skip(skip).limit(limit);
    const total = await Catalog.countDocuments(query);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  static async getItemById(id: string) {
    return await Catalog.findById(id);
  }

  static async updateItem(id: string, data: Partial<ICatalog>) {
    return await Catalog.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteItem(id: string) {
    return await Catalog.findByIdAndDelete(id);
  }
}
