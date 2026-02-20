const { Schema, model } = require("mongoose");

const generateRandomPassword = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const userSchema = new Schema(
  {
    // Basic Info
    name: { type: String },
    number: { type: String, required: true, unique: true },
    email: { type: String, sparse: true },
    password: { type: String, default: generateRandomPassword },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    religion: { type: String, default: "Islam" },
    maritalStatus: {
      type: String,
      enum: [
        "Single",
        "bidhoba",
        "Divorced",
        "Widowed",
        "Married",
        "bipotnik",
        "Separated",
        "Annulled",
        "Complicated",
        "Polygamy",
      ],
    },

    // Physical Appearance
    height: { type: String },
    weight: { type: String },
    skinColor: {
      type: String,
      enum: ["Fair", "Medium", "Dark", "Very Fair", "Wheatish", "Other"],
    },
    bloodGroup: { type: String },

    // Address Info
    country: { type: String },
    division: { type: String },
    zilla: { type: String },
    upazila: { type: String },
    village: { type: String },
    permanent_address: { type: String },
    present_address: { type: String },
    sameAddress: { type: Boolean, default: false },

    // Education
    education_type: { type: String },
    educational_qualification: { type: String },
    completed_class: { type: String },
    ssc_passing_year: { type: String },
    ssc_group: { type: String },
    ssc_result: { type: String },

    hsc_candidate: { type: String },
    hsc_passing_year: { type: String },
    hsc_group: { type: String },
    hsc_result: { type: String },

    diploma_subject: { type: String },
    diploma_institute_name: { type: String },
    diploma_running_year: { type: String },
    diploma_passing_year: { type: String },

    after_ssc_medium: { type: String },

    bachelor_subject: { type: String },
    bachelor_institute: { type: String },
    bachelor_year: { type: String },
    bachelor_pass_year: { type: String },

    masters_subject: { type: String },
    masters_institute: { type: String },
    masters_pass_year: { type: String },

    currentStatus: { type: String },
    institutionOrCompany: { type: String },
    monthlyIncome: { type: String },

    // Family Info
    father_name: { type: String },
    father_alive: { type: String },
    father_occupation: { type: String },
    mother_name: { type: String },
    mother_alive: { type: String },
    mother_occupation: { type: String },
    brothers_count: { type: String },
    sisters_count: { type: String },
    uncle_occupation: { type: String },
    family_economic_status: { type: String },
    family_economic_description: { type: String },
    biyeDate: {
      type: String,
      enum: ["urgent", "threeMonth", "betterMatch"], // database এ save হবে এই English value গুলো
    },

    // Marriage Info
    guardian_permission: { type: String },
    why_remarry: { type: String },
    wives_children_count: { type: String },
    divorce_reason: { type: String },
    wife_death_detail: { type: String },
    allow_study: { type: String },
    allow_job: { type: String },
    where_live: { type: String },
    expect_gift: { type: String },
    husband_death_detail: { type: String },
    willing_to_work: { type: String },
    continue_study: { type: String },
    continue_job: { type: String },

    // Partner Preferences
    minAge: { type: String },
    maxAge: { type: String },
    skinTone: { type: String },
    partnerHeight: { type: String },
    partnerEducation: {
      type: String,
      enum: [
        "School",
        "College",
        "University",
        "Diploma",
        "Madrasha",
        "Technical Education",
        "Honours",
        "Masters",
        "PhD",
        "Other",
        "",
      ],
    },
    partnerProfession: {
      type: String,
      enum: [
        "চাকুরিজীবী",
        "ব্যবসায়ী",
        "ছাত্র",
        "প্রবাসী",
        "বেকার",
        "ডাক্তার",
        "শিক্ষক",
        "ইমাম",
        "ইঞ্জিনিয়ার",
        "আইনজীবী",
        "ফ্রিল্যান্সার",
        "সরকারি চাকরি",
        "বেসরকারি চাকরি",
        "সামরিক বাহিনী",
        "অন্যান্য",
      ],
    },

    partnerCountry: {
      type: String,
      enum: ["Bangladesh", "UK", "Europe", "USA", "Canada", ""],
    },
    partnerDistrict: { type: String },
    partnerEconomicStatus: {
      type: String,
      enum: [
        "High Class",
        "Upper Middle Class",
        "Middle Class",
        "Lower Middle Class",
        "Lower Class",
        "",
      ],
    },
    partnerExpectation: { type: String },
    partnerPreferences: {
      partnerPreferences: {
        type: [String],
        enum: [
          "Religious",
          "Namazi",
          "Hijabi",
          "Bearded",
          "Charactered",
          "Family Oriented",
          "Responsible",
          "Educated",
          "Honest",
          "Trustworthy",
          "Caring",
          "Loving",
          "Cook",
          "Modern",
          "Western Minded",
          "Cultural",
          "",
        ],
        validate: {
          validator: function (val) {
            return val.length <= 5; // সর্বোচ্চ ৫টা select করা যাবে
          },
          message: "You can select up to 5 qualities only.",
        },
      },
    },

    // Occupation
    pesha: { type: String },
    pesha_biboron: { type: String },
    monthly_income: { type: String },

    // Contact
    ownerName: { type: String },
    guardianMobile: { type: String },
    guardianRelation: { type: String },
    biodataEmail: { type: String },

    // Photos and Documents
    photo: { type: String, default: "" },
    profilePhotoPrivacy: {
      type: String,
      enum: ["public", "hide"],
      default: "public",
    },
    video: { type: String, default: "" },
    nidImage: { type: String, default: "" },
    biodataPdf: { type: String, default: "" },
    gallery: {
      photos: {
        type: [String],
        validate: {
          validator: function (val) {
            return val.length <= 5;
          },
          message: "You can upload a maximum of 5 photos only.",
        },
        default: [],
      },

      video: {
        type: String, // single gallery video
        default: "",
      },
    },

    // gallaryPrivacy: {
    //   type: String,
    //   enum: ["public", "hide"],
    //   default: "public",
    // },

    //extra
    shortBio: { type: String, default: "" },
    likesAboutPartner: { type: String, default: "" },
    partnerExpectations: { type: String, default: "" },
    // Profile Interaction

    favoritedUsers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    // এই ইউজারের প্রতি কারা ইন্টারেস্ট দিয়েছে
    interestedUsers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    interestedBy: [{ type: Schema.Types.ObjectId, ref: "Users" }],

    profileViews: {
      count: { type: Number, default: 0 },
      viewedBy: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    reportedUsers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "Users" },
        reason: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],

    // Admin & Status
    // verified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified", // নতুন ইউজার by default unverified
    },

    disabled: { type: Boolean, default: false },
    notes: { type: String, default: "" },

    profileViews: {
      count: { type: Number, default: 0 },
      viewedBy: [
        {
          user: { type: Schema.Types.ObjectId, ref: "Users", default: null }, // null হলে guest
          ip: { type: String },
          date: { type: Date, default: Date.now },
        },
      ],
    },

    subscription: {
      type: {
        plan: {
          type: String,
          enum: ["basic", "bronze", "gold", "platinum", "none"],
          default: "none",
        },
        smsLimit: { type: Number, default: 0 },
        usedSms: { type: Number, default: 0 }, // কতটা already use করেছে
        interestLimit: { type: Number, default: 0 }, // 🆕
        usedInterest: { type: Number, default: 0 }, // 🆕
        price: { type: Number, default: 0 }, // plan এর price
        status: {
          type: String,
          enum: ["pending", "active", "expired", "rejected", "none"],
          default: "pending",
        },
        startDate: { type: Date },
        endDate: { type: Date },
        // payment info
        paymentNumber: { type: String }, // যে নাম্বার থেকে টাকা পাঠানো হলো
        transactionId: { type: String }, // trxID
        screenshot: { type: String }, // optional image url
      },
      default: {},
    },
  },

  { timestamps: true },
);

const Users = model("Users", userSchema);
module.exports = Users;
