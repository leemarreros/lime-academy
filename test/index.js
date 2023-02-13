const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

var bn = (num) => ethers.BigNumber.from(String(num));
var zero_address = "0x0000000000000000000000000000000000000000";

describe("BookLibrary", function () {
  var bookLibrary, owner, books, quantities;

  async function deployBookLibrary() {
    const [owner, alice, bob, carl] = await ethers.getSigners();

    const BookLibrary = await ethers.getContractFactory("BookLibrary");
    const bookLibrary = await BookLibrary.deploy();

    // Adding 10 books
    var books = [
      "One Hundred Years of Solitude", // id = 0
      "Anna Karenina", // id = 1
      "To Kill a Mockingbird", // id = 2
      "The Great Gatsby", // id = 3
      "A Passage to India", // id = 4
      "Invisible Man", // id = 5
      "Don Quixote", // id = 6
      "Beloved", // id = 7
      "Mrs. Dalloway", // id = 8
      "Things Fall Apart", // id = 9
    ];
    var quantities = [2, 2, 2, 2, 1, 2, 2, 2, 1, 3];
    var promises = books.map((val, ix) =>
      bookLibrary.addBook(books[ix], quantities[ix])
    );
    await Promise.all(promises);

    return { bookLibrary, owner, alice, bob, carl, books, quantities };
  }

  describe("Adding a book", function () {
    beforeEach(async () => {
      var fixture = await loadFixture(deployBookLibrary);
      bookLibrary = fixture.bookLibrary;
      owner = fixture.owner;
      books = fixture.books;
      quantities = fixture.quantities;
    });

    it("Book quantity should be above 0", async function () {
      await expect(
        bookLibrary.addBook("The Lord of the Rings", 0)
      ).to.be.rejectedWith("Add a book with number of copies above zero");
    });

    it("Book is only added by the owner", async function () {
      var [owner, alice] = await ethers.getSigners();

      await expect(
        bookLibrary.connect(alice).addBook("The Lord of the Rings", 2)
      ).to.be.rejectedWith("Ownable: caller is not the owner");
    });

    it("Book was added to list", async function () {
      var promises = quantities.map((val, ix) => {
        return bookLibrary.books(ix);
      });
      var res = await Promise.all(promises);
      res.forEach((val, ix) => {
        var [_bookName, _numberOfCopies] = val;
        expect(_bookName).to.be.equal(books[ix]);
        expect(_numberOfCopies).to.be.equal(quantities[ix]);
      });
    });

    it("Check if book is in list of available ones", async function () {
      var promises = quantities.map((val, ix) => {
        return bookLibrary.availableBooks(ix);
      });
      var res = await Promise.all(promises);
      res.forEach((val, ix) => {
        expect(val).to.be.equal(ix);
      });
    });

    it("Check index of added book", async function () {
      var promises = quantities.map((val, ix) => {
        return bookLibrary.ixAvailableBooks(ix);
      });
      var res = await Promise.all(promises);
      res.forEach((val, ix) => {
        expect(val).to.be.equal(ix);
      });
    });

    it("Get list of Available Books", async function () {
      var index = 0;
      var list = await bookLibrary.getAvailableBooks();

      list.forEach((val, ix) => {
        var [_bookName, _borrowers, _numberOfCopies] = val;
        expect(_bookName).to.be.equal(books[ix]);
        expect(_borrowers).to.be.an.an("array").that.is.empty;
        expect(_numberOfCopies).to.be.equal(bn(quantities[ix]));
      });
    });
  });

  describe("Borrowing a book", () => {
    var alice, bob, carl;
    var idAlice;
    var idBob;
    var idCarl;

    beforeEach(async () => {
      var fixture = await loadFixture(deployBookLibrary);
      bookLibrary = fixture.bookLibrary;
      owner = fixture.owner;
      alice = fixture.alice;
      bob = fixture.bob;
      carl = fixture.carl;
      books = fixture.books;
      quantities = fixture.quantities;

      // borrowing  book
      // index         0  1  2  3  4  5  6  7  8  9
      // quantities = [2, 2, 2, 2, 1, 2, 2, 2, 1, 3];
      idAlice = 5;
      await bookLibrary.connect(alice).borrowBookById(idAlice);
      idBob = 5;
      await bookLibrary.connect(bob).borrowBookById(idBob);
      idCarl = 6;
      await bookLibrary.connect(carl).borrowBookById(idCarl);
    });

    it("Cannot borrow the same book twice", async () => {
      idAlice = 5;
      await expect(
        bookLibrary.connect(alice).borrowBookById(idAlice)
      ).to.be.revertedWith("Cannot borrow the same book twice");
    });

    it("No book copies available after borowing", async () => {
      idAlice = 5;
      await expect(
        bookLibrary.connect(carl).borrowBookById(idAlice)
      ).to.be.revertedWith("No book copy available");
    });

    it("Book with no copies is not available", async () => {
      var filtered;
      var availableBooks = await bookLibrary.getAvailableBooks();

      filtered = availableBooks.filter((val, ix) => {
        var [_bookName, _borrowers, _numberOfCopies] = val;
        return _bookName == books[idAlice];
      });
      expect(filtered).to.be.an("Array").that.is.empty;
    });

    it("One (from two) is left for borrowing", async () => {
      var filtered;
      var availableBooks = await bookLibrary.getAvailableBooks();

      filtered = availableBooks.filter((val, ix) => {
        var [_bookName, _borrowers, _numberOfCopies] = val;
        return _bookName == books[idCarl];
      });
      var [_bookName, _borrowers, _numberOfCopies] = filtered[0];

      expect(_bookName).to.be.equal(books[idCarl]);
      expect(_numberOfCopies).to.be.equal(bn(quantities[idCarl] - 1));
    });

    it("There is a list of borrowers for a book", async () => {
      var list = await bookLibrary.getBorrowersOfBookById(idBob);
      expect(list[0]).to.be.equal(alice.address);
      expect(list[1]).to.be.equal(bob.address);
    });

    it("Caller did not borrow this book", async () => {
      await expect(
        bookLibrary.connect(carl).returnBookById(idAlice)
      ).to.be.revertedWith("Caller did not borrow this book");
    });

    it("Once returned, book is included in list", async () => {
      await bookLibrary.connect(alice).returnBookById(idAlice);
      var filtered;
      var availableBooks = await bookLibrary.getAvailableBooks();

      filtered = availableBooks.filter((val, ix) => {
        var [_bookName, _borrowers, _numberOfCopies] = val;
        return _bookName == books[idAlice];
      });
      var [_bookName, _borrowers, _numberOfCopies] = filtered[0];
      expect(_bookName).to.be.equal(books[idAlice]);
      expect(_numberOfCopies).to.be.equal(bn(quantities[idAlice] - 1));
    });
  });
});
