const Category = require("../models/category.model");
const Product = require("../models/product.model");

// tạo danh mục
function CategoryController() {
  // tạo danh mục lưu vào db
  this.create = async (req, res) => {
    try {
      const { name } = req.body;
      const category = new Category({ name });
      await category.save();
      res.status(201).json({ message: "Created successfully", data: category });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // lấy tất cả danh mục
  this.getAll = async (req, res) => {
    try {
      let name = req.query.name;
      let query = {};
      if (name && name !== "") {
        query.name = { $regex: name, $options: "i" };
      }

      const categories = await Category.find(query);
      res.status(200).json({ data: categories });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // truy suất theo id 
  this.getById = async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found!" });
      }
      res.status(200).json({ data: category });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // cập nhập danh mục theo id 
  this.update = async (req, res) => {
    try {
      const { name } = req.body;
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { name },
        { new: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found!" });
      }
      res
        .status(200)
        .json({ message: "Updated successfully", data: updatedCategory });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // xóa danh mục
  this.delete = async (req, res) => {
    try {
      const categoryId = req.params.id;

      const productsCount = await Product.countDocuments({ categoryId });

      // còn sản phẩm không xóa
      if (productsCount > 0) {
        return res.status(400).json({
          message:
            "Cannot delete category. There are still products associated with it.",
        });
      }

      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found!" });
      }

      res
        .status(200)
        .json({ message: "Deleted successfully", data: deletedCategory });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  this.getAllCategoryWithProducts = async (req, res) => {
    try {
      const categories = await Category.find();
      const categoriesWithProducts = [];

      for (let category of categories) {
        let productsQuery = { categoryId: category._id };

        if (req.query.name) {
          productsQuery.name = { $regex: new RegExp(req.query.name, "i") };
        }

        const products = await Product.find(productsQuery);

        if (products.length > 0) {
          categoriesWithProducts.push({
            category: category,
            products: products,
          });
        }
      }

      res.status(200).json({ data: categoriesWithProducts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return this;
}

module.exports = CategoryController();
