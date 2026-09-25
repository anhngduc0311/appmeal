const RoleRepository = require("../../repos/RoleRepository");

const RoleService = require("../../services/RoleService");

const RoleController = require("../../controllers/RoleController");

const roleRoutes = require("../../routes/RoleRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const roleRepository = new RoleRepository();

const roleService = new RoleService(roleRepository);

const roleController = new RoleController(roleService);

module.exports = {
  router: roleRoutes(roleController, authMiddleware, authorize),
  service: roleService,
};
