class Payment {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.userName = data.user_full_name;
    this.paymentDate = data.payment_date;
    this.amount = data.amount;
    this.isPaid = !!Number(data.is_paid);
    this.paidAt = data.paid_at;
    this.paidAmount = data.paid_amount;
    this.billImg = data.bill_img;
    this.status = data.status;
  }
}

module.exports = Payment;
