const axios = require("axios");
const FormData = require("form-data");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const SubscriptionPlan = require("../models/subscritionAd.model");

// Endpoint (শেষে slash জরুরি)
const SP_ENDPOINT = "https://sandbox.shurjopayment.com/api/";
const SP_USERNAME = "sp_sandbox";
const SP_PASSWORD = "pyyk97hu&6u6"; // ✅ correct sandbox password

// ===============================
// 1️⃣ INITIATE PAYMENT
// ===============================
exports.initiatePayment = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user || !plan) {
      return res.status(404).json({ message: "User or Plan not found" });
    }

    // 🔐 Step 1: Get Token
    const authRes = await axios.post(`${SP_ENDPOINT}get_token`, {
      username: SP_USERNAME,
      password: SP_PASSWORD,
    });

    const tokenData = Array.isArray(authRes.data)
      ? authRes.data[0]
      : authRes.data;

    if (!tokenData?.token) {
      console.error("Token Error:", authRes.data);
      return res.status(401).json({ message: "ShurjoPay Auth Failed" });
    }

    // const order_id = `ORDER_${Date.now()}`;
    const order_id = String(Date.now());

    // 💳 Step 2: Prepare payment data (ALL STRING)
    const paymentData = {
      prefix: "sp",
      token: tokenData.token,
      store_id: String(tokenData.store_id),
      amount: String(plan.price),
      order_id,
      currency: "BDT",
      return_url: "http://localhost:3000/api/v1/payment/verify",
      cancel_url: "http://localhost:3000/api/v1/payment/verify",
      client_ip: "127.0.0.1",
      customer_name: user.name || "Test User",
      customer_phone: "01711223344",
      customer_email: user.email || "test@gmail.com",
      customer_address: "Dhaka",
      customer_city: "Dhaka",
      customer_state: "Dhaka",
      customer_postcode: "1212",
      customer_country: "Bangladesh",
    };

    // 📦 Step 3: Convert to FORM-DATA
    const form = new FormData();
    Object.entries(paymentData).forEach(([key, value]) => {
      form.append(key, value);
    });

    // 🚀 Step 4: Call secret-pay
    const paymentRes = await axios.post(`${SP_ENDPOINT}secret-pay`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `${tokenData.token_type} ${tokenData.token}`,
      },
    });

    const finalRes = Array.isArray(paymentRes.data)
      ? paymentRes.data[0]
      : paymentRes.data;

    if (!finalRes?.checkout_url) {
      console.error("Payment Initiate Error:", finalRes);
      return res.status(400).json({
        message: "Payment Initiation Failed",
        details: finalRes,
      });
    }

    // 🧾 Save pending payment
    await Payment.create({
      user: userId,
      subscriptionPlan: planId,
      amount: plan.price,
      order_id,
      status: "pending",
    });

    return res.status(200).json({
      checkout_url: finalRes.checkout_url,
    });
  } catch (error) {
    console.error(
      "Initiate Payment Error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// ===============================
// 2️⃣ VERIFY PAYMENT
// ===============================

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { order_id } = req.query;

//     if (!order_id) {
//       // যদি আইডি না থাকে তবে হোমপেজে পাঠিয়ে দাও
//       return res.redirect("http://localhost:5173/?payment=error");
//     }

//     // 🔐 Step 1: টোকেন সংগ্রহ
//     const authRes = await axios.post(`${SP_ENDPOINT}get_token`, {
//       username: SP_USERNAME,
//       password: SP_PASSWORD,
//     });

//     const tokenData = Array.isArray(authRes.data) ? authRes.data[0] : authRes.data;

//     // 🔎 Step 2: ভেরিফিকেশন
//     const verifyRes = await axios.post(
//       `${SP_ENDPOINT}verification`,
//       { order_id },
//       {
//         headers: {
//           Authorization: `${tokenData.token_type} ${tokenData.token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const finalRes = Array.isArray(verifyRes.data) ? verifyRes.data[0] : verifyRes.data;

//     // ✅ পেমেন্ট সফল হলে
//     if (finalRes.sp_code === "1000") {
//       const payment = await Payment.findOneAndUpdate(
//         { order_id: order_id }, 
//         {
//           status: "success",
//           transaction_id: finalRes.bank_trx_id,
//           payment_method: finalRes.method,
//         },
//         { new: true }
//       ).populate("subscriptionPlan");

//       if (payment) {
//         const duration = payment.subscriptionPlan.durationInDays || 30;

//         await User.findByIdAndUpdate(payment.user, {
//           "subscription.activePlan": payment.subscriptionPlan.name,
//           "subscription.smsLimit": payment.subscriptionPlan.smsLimit,
//           "subscription.interestLimit": payment.subscriptionPlan.interestLimit,
//           "subscription.status": "active",
//           "subscription.endDate": new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
//         });

//         // 🎯 এখানে লক্ষ্য করুন: আপনার রিঅ্যাক্ট রাউটার অনুযায়ী ড্যাশবোর্ড লিঙ্ক হলো /user/:id
//         return res.redirect(`http://localhost:5173/user/${payment.user}?payment=success`);
//       }
//     }

//     // ❌ পেমেন্ট ফেইল করলে
//     await Payment.findOneAndUpdate({ order_id }, { status: "failed" });
//     return res.redirect("http://localhost:5173/?payment=failed");

//   } catch (error) {
//     console.error("Verify Error:", error.message);
//     return res.redirect("http://localhost:5173/?payment=error");
//   }
// };



// ===============================
// 2️⃣ VERIFY PAYMENT (FIXED)
// ===============================
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.redirect("http://localhost:5173/?payment=error");
    }

    // ১. টোকেন সংগ্রহ
    const authRes = await axios.post(`${SP_ENDPOINT}get_token`, {
      username: SP_USERNAME,
      password: SP_PASSWORD,
    });
    const tokenData = Array.isArray(authRes.data) ? authRes.data[0] : authRes.data;

    // ২. ভেরিফিকেশন
    const verifyRes = await axios.post(
      `${SP_ENDPOINT}verification`,
      { order_id },
      {
        headers: {
          Authorization: `${tokenData.token_type} ${tokenData.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const finalRes = Array.isArray(verifyRes.data) ? verifyRes.data[0] : verifyRes.data;

    // ৩. পেমেন্ট সাকসেস চেক
    if (finalRes.sp_code === "1000") {
      
      // 🔎 [FIX]: আইডি ম্যাচ করানোর বিশেষ লজিক
      // যদি সূর্যপে আইডির শুরুতে 'sp' যোগ করে দেয়, তবে সেটা বাদ দিয়ে ডাটাবেসে খুঁজবে
      let cleanOrderId = order_id;
      if (order_id.startsWith("sp")) {
        cleanOrderId = order_id.substring(2); 
      }

      // ডাটাবেসে অরিজিনাল আইডি দিয়ে খোঁজা (Regex ব্যবহার করা হয়েছে যাতে sp থাকলেও খুঁজে পায়)
      const payment = await Payment.findOneAndUpdate(
        { order_id: { $regex: order_id.replace("sp", "") } },
        {
          status: "success",
          transaction_id: finalRes.bank_trx_id,
          payment_method: finalRes.method,
        },
        { new: true },
      ).populate("subscriptionPlan");

      if (payment) {
        const duration = payment.subscriptionPlan.durationInDays || 30;

        await User.findByIdAndUpdate(payment.user, {
          "subscription.activePlan": payment.subscriptionPlan.name,
          "subscription.smsLimit": payment.subscriptionPlan.smsLimit,
          "subscription.interestLimit": payment.subscriptionPlan.interestLimit,
          "subscription.status": "active",
          "subscription.endDate": new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        });

        // সঠিক ইউজারের ড্যাশবোর্ডে পাঠানো
        return res.redirect(`http://localhost:5173/user/${payment.user}?payment=success`);
      } else {
        console.error("Payment not found in DB even after cleanup:", order_id);
      }
    }

    // যদি পেমেন্ট সাকসেস না হয়
    return res.redirect("http://localhost:5173/?payment=failed");

  } catch (error) {
    console.error("Verify Error:", error.message);
    return res.redirect("http://localhost:5173/?payment=error");
  }
};