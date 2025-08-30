const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SplitWise 3.0 Contracts", function () {
  let ExpenseFactory, expenseFactory;
  let GroupTreasury;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    ExpenseFactory = await ethers.getContractFactory("ExpenseFactory");
    expenseFactory = await ExpenseFactory.deploy();
    await expenseFactory.deployed();
  });

  describe("ExpenseFactory", function () {
    it("Should create a new group", async function () {
      const tx = await expenseFactory.connect(user1).createGroup("Test Group", "Alice");
      const receipt = await tx.wait();
      
      const event = receipt.events?.find(e => e.event === "GroupCreated");
      expect(event).to.not.be.undefined;
      
      const groupAddress = event.args.group;
      const userGroups = await expenseFactory.getUserGroups(user1.address);
      expect(userGroups).to.include(groupAddress);
    });

    it("Should return user's groups", async function () {
      await expenseFactory.connect(user1).createGroup("Group 1", "Alice");
      await expenseFactory.connect(user1).createGroup("Group 2", "Alice");
      
      const userGroups = await expenseFactory.getUserGroups(user1.address);
      expect(userGroups.length).to.equal(2);
    });

    it("Should track total groups count", async function () {
      expect(await expenseFactory.getTotalGroupsCount()).to.equal(0);
      
      await expenseFactory.connect(user1).createGroup("Group 1", "Alice");
      expect(await expenseFactory.getTotalGroupsCount()).to.equal(1);
      
      await expenseFactory.connect(user2).createGroup("Group 2", "Bob");
      expect(await expenseFactory.getTotalGroupsCount()).to.equal(2);
    });
  });

  describe("GroupTreasury", function () {
    let groupAddress, groupContract;

    beforeEach(async function () {
      const tx = await expenseFactory.connect(user1).createGroup("Test Group", "Alice");
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "GroupCreated");
      groupAddress = event.args.group;
      
      GroupTreasury = await ethers.getContractFactory("GroupTreasury");
      groupContract = GroupTreasury.attach(groupAddress);
    });

    it("Should have correct initial state", async function () {
      expect(await groupContract.groupName()).to.equal("Test Group");
      expect(await groupContract.owner()).to.equal(user1.address);
      expect(await groupContract.getMemberCount()).to.equal(1);
    });

    it("Should add members", async function () {
      await groupContract.connect(user1).addMember(user2.address, "Bob");
      expect(await groupContract.getMemberCount()).to.equal(2);
      
      const member = await groupContract.getMemberInfo(user2.address);
      expect(member.nickname).to.equal("Bob");
      expect(member.active).to.be.true;
    });

    it("Should add expenses and calculate splits", async function () {
      // Add members
      await groupContract.connect(user1).addMember(user2.address, "Bob");
      await groupContract.connect(user1).addMember(user3.address, "Charlie");
      
      // Add expense
      const participants = [user1.address, user2.address, user3.address];
      await groupContract.connect(user1).addExpense("Dinner", ethers.utils.parseEther("0.3"), participants);
      
      expect(await groupContract.getExpenseCount()).to.equal(1);
      
      // Check balances
      const user1Balance = await groupContract.getBalance(user1.address);
      const user2Balance = await groupContract.getBalance(user2.address);
      const user3Balance = await groupContract.getBalance(user3.address);
      
      // User1 paid, so should have positive balance
      expect(user1Balance).to.be.gt(0);
      // User2 and User3 owe money, so should have negative balance
      expect(user2Balance).to.be.lt(0);
      expect(user3Balance).to.be.lt(0);
    });

    it("Should settle debts", async function () {
      // Add member and expense
      await groupContract.connect(user1).addMember(user2.address, "Bob");
      const participants = [user1.address, user2.address];
      await groupContract.connect(user1).addExpense("Lunch", ethers.utils.parseEther("0.2"), participants);
      
      // Check debt
      const debtAmount = await groupContract.connect(user2).getDebtTo(user1.address);
      expect(debtAmount).to.be.gt(0);
      
      // Settle debt
      await groupContract.connect(user2).settleDebt(user1.address, { value: debtAmount });
      
      // Verify debt is cleared
      const newDebt = await groupContract.connect(user2).getDebtTo(user1.address);
      expect(newDebt).to.equal(0);
    });

    it("Should get expenses list", async function () {
      await groupContract.connect(user1).addMember(user2.address, "Bob");
      const participants = [user1.address, user2.address];
      
      await groupContract.connect(user1).addExpense("Breakfast", ethers.utils.parseEther("0.1"), participants);
      await groupContract.connect(user2).addExpense("Coffee", ethers.utils.parseEther("0.05"), participants);
      
      const expenses = await groupContract.getExpenses();
      expect(expenses.length).to.equal(2);
      expect(expenses[0].description).to.equal("Breakfast");
      expect(expenses[1].description).to.equal("Coffee");
    });
  });
});