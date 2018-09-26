const express = require('express');
const passport = require('passport');
const { clearHash } = require('../../config/cache');

// Load Validation
const validateCategoryInput = require('../../validation/category');
const isStaff = require('../../utils/isStaff');
// Load Category Model
const Category = require('../../models/Category');

const Book = require('../../models/Book');

const router = express.Router();


/**
 * @swagger
 * /api/categories/test:
 *   get:
 *     tags:
 *       - Category
 *     summary: Tests categories route
 *     description: Tests categories route
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Category Works
 */
router.get('/test', (req, res) => res.json({ msg: 'Category Works' }));

// keep the parent category only
function filterSubCategories(categories) {
  let result = categories.slice();
  categories.forEach((category) => {
    if (category.subCategories.length > 0) {
      category.subCategories.forEach((subCategory) => {
        categories.forEach((c, index) => {
          if (c.name === subCategory.subname) {
            result.splice(index, 1, null);
          }
        });
      });
    }
  });
  result = result.filter(v => v);
  return result;
}

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Category
 *     summary: Get all categories
 *     description: Get all categories
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Get all categories successfully
 *       404:
 *         description: No categories found
 */
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find()
      .sort({ name: 1 });
    categories = filterSubCategories(categories);
    return res.json(categories);
  } catch (err) {
    return res.status(404)
      .json({ categorynotfound: 'No categories found' });
  }
});

/**
 * @swagger
 * /api/categories/list:
 *   get:
 *     tags:
 *       - Category
 *     summary: Get all categories with their books
 *     description: Get all categories with their books
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Get all categories successfully
 *       404:
 *         description: No categories found
 */
router.get('/list', async (req, res) => {
  const allCategories = [];
  let counter = 0;
  try {
    let categories = await Category.find()
      .sort({ name: 1 })
      .cache();
    // keep the parent category only
    categories = filterSubCategories(categories);

    categories.forEach(async (category) => {
      const books = await Book.find({ category: category._id })
        .cache({ key: category._id });
      counter += 1;
      const categoryResult = {};
      categoryResult._id = category._id;
      categoryResult.slug = category.slug;
      categoryResult.name = category.name;
      categoryResult.subCategories = category.subCategories;
      categoryResult.books = books;
      allCategories.push(categoryResult);
      if (counter === categories.length) {
        return res.json(allCategories);
      }
      return true;
    });
  } catch (err) {
    return res.status(404)
      .json({ categorynotfound: 'No categories found' });
  }
  return false;
});

// Get category by condition. id or slug
async function getCategoryByCondition(condition, req, errors) {
  const category = await Category.findOne(condition)
    .cache({ key: condition });
  if (!category) {
    errors.categorynotfound = 'No categories found';
    return null;
  }

  const categoryResult = {};
  categoryResult.id = category._id;
  categoryResult.slug = category.slug;
  categoryResult.name = category.name;
  categoryResult.subCategories = category.subCategories;

  const page = parseInt(req.query.page, 10);
  const pageSize = parseInt(req.query.pageSize, 10);
  // 1 for oldest to newest, -1 for newest to oldest
  const sortByPublish = parseInt(req.query.publish, 10);
  // 1 for cheapest to most expensive
  const sortByPrice = parseInt(req.query.price, 10);
  const sortParams = {};
  if (sortByPublish) {
    sortParams.publishDate = sortByPublish;
  }
  if (sortByPrice) {
    sortParams.price = sortByPrice;
  }
  const interval = (page - 1) * pageSize;

  // find books related to this category
  const books = await Book.find({ category: category._id })
    .skip(interval)
    .limit(pageSize)
    .sort(sortParams)
    .cache({ key: category._id });
  categoryResult.books = books;
  return categoryResult;
}

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     tags:
 *       - Category
 *     summary: Get category by slug
 *     description: Get category by slug. Example http://localhost:5000/api/categories/slug/game Any details please refer to https://github.com/talha-asad/mongoose-url-slugs
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: "slug"
 *         in: "path"
 *         description: "Slug of category that needs to be fetched"
 *         required: true
 *         type: "string"
 *       - name: "page"
 *         in: "query"
 *         description: "the page you are query (powered by pageSize)"
 *         required: true
 *         type: "integer"
 *       - name: "pageSize"
 *         in: "query"
 *         description: "How many books you want to show in one page"
 *         required: true
 *         type: "integer"
 *       - name: "publish"
 *         in: "query"
 *         description: "Sort result by publish date, 1 for oldest to newest, -1 for newest to oldest"
 *         required: false
 *         type: "integer"
 *       - name: "price"
 *         in: "query"
 *         description: "Sort result by price, 1 for cheapest to most expensive, -1 for most expensive to cheapest"
 *         required: false
 *         type: "integer"
 *     responses:
 *       200:
 *         description: Get category successfully
 *       404:
 *         description: No categories found
 */
router.get('/slug/:slug', async (req, res) => {
  const errors = {};
  try {
    const category = await getCategoryByCondition(
      { slug: req.params.slug }, req, errors
    );
    if (category) {
      return res.json(category);
    } else {
      errors.categorynotfound = 'No categories found';
      return res.status(404)
        .json(errors);
    }
  } catch (err) {
    errors.categorynotfound = 'No categories found';
    return res.status(404)
      .json(errors);
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Category
 *     summary: Get category by id
 *     description: Get category by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "ID of category that needs to be fetched"
 *         required: true
 *         type: "string"
 *       - name: "page"
 *         in: "query"
 *         description: "the page you are query (powered by pageSize)"
 *         required: true
 *         type: "integer"
 *       - name: "pageSize"
 *         in: "query"
 *         description: "How many books you want to show in one page"
 *         required: true
 *         type: "integer"
 *       - name: "publish"
 *         in: "query"
 *         description: "Sort result by publish date, 1 for oldest to newest, -1 for newest to oldest"
 *         required: false
 *         type: "integer"
 *       - name: "price"
 *         in: "query"
 *         description: "Sort result by price, 1 for cheapest to most expensive, -1 for most expensive to cheapest"
 *         required: false
 *         type: "integer"
 *     responses:
 *       200:
 *         description: Get category successfully
 *       404:
 *         description: No categories found
 */
router.get('/:id', async (req, res) => {
  const errors = {};
  try {
    const category = await getCategoryByCondition(
      { _id: req.params.id }, req, errors
    );
    if (category) {
      return res.json(category);
    } else {
      errors.categorynotfound = 'No categories found';
      return res.status(404)
        .json(errors);
    }
  } catch (err) {
    errors.categorynotfound = 'No categories found';
    return res.status(404)
      .json(errors);
  }
});

/**
 * @swagger
 * definitions:
 *   Category:
 *     properties:
 *       name:
 *         type: string
 */
/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Category
 *     summary: Create category
 *     description: Registers a new category with different name from database. Category can only be created by staff.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Created category object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Category'
 *     responses:
 *       200:
 *         description: Successfully created
 *       400:
 *         description: Form validation fail
 *       401:
 *         description: Cannot create the category
 *       404:
 *         description: Category name has existed
 */
router.post(
  '/',
  passport.authenticate('jwt', {
    session: false,
  }),
  async (req, res) => {
    try {
      // find out whether user is staff
      const userIsStaff = await isStaff(req);
      if (!userIsStaff) {
        return res.status(401)
          .json({ unauthorized: 'Cannot modify the book' });
      }

      const hasFound = await Category.findOne({ name: req.body.name });
      if (hasFound) {
        return res.status(404)
          .json({ categoryexist: 'Category name has existed' });
      }
      // category not exist
      const {
        errors,
        isValid,
      } = validateCategoryInput(req.body);

      if (!isValid) {
        return res.status(400)
          .json(errors);
      }
      const newCategory = new Category({
        name: req.body.name,
      });

      const categoryObject = await newCategory.save();
      return res.json(categoryObject);
    } catch (err) {
      return res.status(404)
        .json({ categorynotfound: 'No categories found' });
    }
  }
);

/**
 * @swagger
 * definitions:
 *   AddSubCategory:
 *     properties:
 *       name:
 *         type: string
 *       id:
 *         type: string
 *       slug:
 *         type: string
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   post:
 *     tags:
 *       - Category
 *     summary: Edit category
 *     description: Edit a exist category (eg add sub category). Category can only be edited by staff. Slug of subCategory has higher priority than id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Edit category object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/AddSubCategory'
 *       - name: "id"
 *         in: "path"
 *         description: "ID of category that needs to be edited"
 *         required: true
 *         type: "string"
 *     responses:
 *       200:
 *         description: Successfully edited
 *       401:
 *         description: Cannot edit the category
 *       404:
 *         description: No categories found or Category name has existed
 *     security:
 *       - JWT: []
 */
router.post(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const errors = {};
    try {
      // find out whether user is staff
      const userIsStaff = await isStaff(req);
      if (!userIsStaff) {
        return res.status(401)
          .json({ unauthorized: 'Cannot modify the book' });
      }

      const category = await Category.findById(req.params.id);
      if (category) {
        if (req.body.slug) {
          const subCategory = await Category.findOne({ slug: req.body.slug });
          category.updateDate = Date.now();
          // Update
          category.subCategories.unshift({
            subid: subCategory._id,
            subname: subCategory.name,
          });
          clearHash('');
          const categoryObject = await category.save();
          return res.json(categoryObject);
        } else if (req.body.id) {
          const subCategory = await Category.findById(req.body.id);
          category.updateDate = Date.now();
          // Update
          category.subCategories.unshift({
            subid: subCategory._id,
            subname: subCategory.name,
          });
          clearHash(req.body.id);
          const categoryObject = await category.save();
          return res.json(categoryObject);
        }
      }
    } catch (err) {
      errors.categorynotfound = 'No categories found';
      return res.status(404)
        .json(errors);
    }
    return false;
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Category
 *     summary: Delete category
 *     description: Delete a exist category. Category can only be deleted by staff. Description field is not required.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "ID of category that needs to be deleted"
 *         required: true
 *         type: "string"
 *     responses:
 *       200:
 *         description: Successfully deleted category Object
 *       401:
 *         description: Cannot delete the category
 *       404:
 *         description: No categories found
 *     security:
 *       - JWT: []
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // find out whether user is staff
      const userIsStaff = await isStaff(req);
      if (!userIsStaff) {
        return res.status(401)
          .json({ unauthorized: 'Cannot modify the book' });
      }
      Category.findOneAndDelete({ _id: req.params.id }, (err) => {
        clearHash(req.params.id);
        return err
          ? res.status(404)
            .json({ categorynotfound: 'No categories found' })
          : res.json({ success: true });
      });
    } catch (err) {
      res.status(404)
        .json({ categorynotfound: 'No categories found' });
    }
    return false;
  }
);

module.exports = router;
