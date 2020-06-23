exports.envguru = async (req, res, next) => {
  const stripe = require("stripe")(
    "sk_test_1my77Ba112VNFwP1spe6oEOD00hVI9kAtW"
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        name: "Mechgiri account",
        description: "Mechgiri account",
        amount: 5000,
        currency: "inr",
        quantity: 1,
      },
    ],
    success_url: `https://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: "https://localhost:3000/cancel",
  });

  console.log(session.id);

  res.json({ sessionId: session.id });
};

exports.test = (req, res, next) => {};
