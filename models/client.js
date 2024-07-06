const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ClientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    coin: {
      type: Number,
      default: 50,
    },
    refferalCoin: {
      type: Number,
      default: 0,
    },
    levelCoin: {
      type: Number,
      default: 10,
    },
    refferalToken: {
      type: String,
      unique: true,
    },
    joiningAmount: {
      type: Number,
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      index: true,
    },
    level: {
      type: Number,
      default: 1,
      index: true,
    },
    layer: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

async function generateUniqueReferralToken() {
  let token;
  let tokenExists = true;

  while (tokenExists) {
    token = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit number
    tokenExists = await mongoose.models.Client.exists({ refferalToken: token });
  }

  return token;
}

ClientSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (!this.refferalToken) {
    this.refferalToken = await generateUniqueReferralToken();
  }

  next();
});

ClientSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

ClientSchema.methods.getProfileTree = async function (maxDepth = 2) {
  const buildTree = async (clientId, depth) => {
    if (depth > maxDepth) return null;
    const client = await this.constructor.findById(clientId).lean();
    if (!client) return null;

    const children = await this.constructor.find({ parentId: clientId }).lean();

    client.children = await Promise.all(
      children.map((child) => buildTree(child._id, depth + 1))
    );

    return client;
  };

  return buildTree(this._id, 0);
};

module.exports = mongoose.model("Client", ClientSchema);
