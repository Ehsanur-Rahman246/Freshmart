import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/users.js";

const farmers = [
  { name: "Abdul Karim", email: "karim.dairy001@farmail.com" },
  { name: "Mizanur Rahman", email: "mizan.pabna@farmail.com" },
  { name: "Rahima Begum", email: "rahima.bogura@farmail.com" },
  { name: "Sirajul Islam", email: "sirajul.bogura@farmail.com" },
  { name: "Nazrul Islam", email: "nazrul.rangpur@farmail.com" },
  { name: "Golam Mostafa", email: "golam.rangpur@farmail.com" },

  {
    name: "Habibur Rahman",
    email: "habib.dinajpur.naogaon@farmail.com",
  },

  { name: "Kamal Hossain", email: "kamal.mymensingh@farmail.com" },
  { name: "Anisur Rahman", email: "anisur.ctg@farmail.com" },
  { name: "Rafiqul Islam", email: "rafiqul.sylhet@farmail.com" },
  { name: "Salma Akter", email: "salma.moulvibazar@farmail.com" },
  { name: "Momtaz Begum", email: "momtaz.bandarban@farmail.com" },

  {
    name: "Anju Chakma",
    email: "anju.khagrachhari.rangamati@farmail.com",
  },

  { name: "Anwar Hossain", email: "anwar.mango@farmail.com" },
  { name: "Fatema Khatun", email: "fatema.rajshahi@farmail.com" },
  { name: "Ismail Hossain", email: "ismail.rajshahi@farmail.com" },
  { name: "Kohinoor Begum", email: "kohinoor.satkhira@farmail.com" },
  { name: "Ruma Aktar", email: "ruma.jashore@farmail.com" },
  { name: "Kamruzzaman Sheikh", email: "kamruzzaman.jashore@farmail.com" },
  { name: "Iqbal Hossain", email: "iqbal.khulna@farmail.com" },
  { name: "Shirin Sultana", email: "shirin.sunamganj@farmail.com" },
  { name: "Abdur Rob", email: "rob.kishoreganj@farmail.com" },
  { name: "Mokbul Hossain", email: "mokbul.netrokona@farmail.com" },
  { name: "Aminul Islam", email: "aminul.barishal@farmail.com" },
  { name: "Nasima Begum", email: "nasima.pirojpur@farmail.com" },
  { name: "Delwar Hossain", email: "delwar.gazipur@farmail.com" },
  { name: "Jamal Uddin", email: "jamal.gazipur@farmail.com" },
  { name: "Yasin Arafat", email: "yasin.narsingdi@farmail.com" },

  {
    name: "Nurul Amin",
    email: "nurul.faridpur.munshiganj@farmail.com",
  },

  { name: "Rashida Khatun", email: "rashida.natore@farmail.com" },
  { name: "Mostafa Kamal", email: "mostafa.thakurgaon@farmail.com" },
  { name: "Selina Akter", email: "selina.chuadanga@farmail.com" },
  { name: "Nurul Haque", email: "nur.kushtia@farmail.com" },

  {
    name: "Jasim Uddin",
    email: "jasim.tangail.manikganj@farmail.com",
  },

  { name: "Aklima Khatun", email: "aklima.bhola@farmail.com" },

  {
    name: "Rehana Aktar",
    email: "rehana.noakhali.patuakhali@farmail.com",
  },

  {
    name: "Aktaruzzaman Bhuiyan",
    email: "aktar.cumilla@farmail.com",
  },
];

const seedFarmers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Connected to database");

    const passwordHash = await bcrypt.hash("123456", 10);

    const users = farmers.map((farmer, index) => ({
      name: farmer.name,
      email: farmer.email.toLowerCase(),

      // +8801710000000, +8801710000001, etc.
      phone: `+${8801710000000 + index}`,

      password: passwordHash,
      role: "farmer",
      isActive: true,
    }));

    // Check for existing emails or phones before inserting.
    const existingUsers = await User.find({
      $or: [
        {
          email: {
            $in: users.map((user) => user.email),
          },
        },
        {
          phone: {
            $in: users.map((user) => user.phone),
          },
        },
      ],
    });

    if (existingUsers.length > 0) {
      console.log("Some users already exist:");

      existingUsers.forEach((user) => {
        console.log(user.email, user.phone);
      });

      process.exit(1);
    }

    await User.insertMany(users);

    console.log(`${users.length} demo farmers inserted successfully.`);
  } catch (error) {
    console.error("Error seeding farmers:", error);
  } finally {
    await mongoose.connection.close();
  }
};

seedFarmers();
