import "@openzeppelin/contracts/access/Ownable.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

contract BookLibrary is Ownable {
    uint256 public counter;

    struct BookInfo {
        string bookName;
        address[] borrowers;
        uint256 numberOfCopies;
    }
    // id => Book Info
    mapping(uint256 => BookInfo) public books;

    // books that have a positive number of copies
    uint256[] public availableBooks;
    // id => index in array `availableBooks`
    mapping(uint256 => uint256) public ixAvailableBooks;

    //address => id => has borrowed a book before or not
    mapping(address => mapping(uint256 => bool)) public hasBorrowedBook;

    //address => id => did borrow a book or not
    mapping(address => mapping(uint256 => bool)) public didBorrowBook;

    function addBook(
        string memory bookName,
        uint256 numberOfCopies
    ) external onlyOwner {
        require(
            numberOfCopies > 0,
            "Add a book with number of copies above zero"
        );
        books[counter].bookName = bookName;
        books[counter].numberOfCopies = numberOfCopies;

        _includeIdInAvailableBooks(counter);

        _increaseCounter();
    }

    function borrowBookById(uint256 id) external {
        BookInfo storage book = books[id];
        require(
            !didBorrowBook[msg.sender][id],
            "Cannot borrow the same book twice"
        );
        require(book.numberOfCopies > 0, "No book copy available");

        didBorrowBook[msg.sender][id] = true;
        book.numberOfCopies--;

        if (!hasBorrowedBook[msg.sender][id]) {
            book.borrowers.push(msg.sender);
            hasBorrowedBook[msg.sender][id] = true;
        }

        if (book.numberOfCopies == 0) {
            _removeIdFromAvailableBooks(id);
        }
    }

    function returnBookById(uint256 id) external {
        BookInfo storage book = books[id];
        require(
            didBorrowBook[msg.sender][id],
            "Caller did not borrow this book"
        );
        didBorrowBook[msg.sender][id] = false;
        book.numberOfCopies++;

        if (book.numberOfCopies == 1) {
            _includeIdInAvailableBooks(id);
        }
    }

    function getAvailableBooks()
        external
        view
        returns (BookInfo[] memory listOfBooks)
    {
        uint256 length = availableBooks.length;
        listOfBooks = new BookInfo[](length);

        for (uint256 i; i < length; i++) {
            listOfBooks[i] = books[availableBooks[i]];
        }
    }

    function getBorrowersOfBookById(
        uint256 id
    ) external view returns (address[] memory) {
        return books[id].borrowers;
    }

    /////////////////////////////////////////////////////
    ////////////        Helpers              ////////////
    /////////////////////////////////////////////////////

    function _removeIdFromAvailableBooks(uint256 id) internal {
        uint256 ixToRemove = ixAvailableBooks[id];
        uint256 lastId = availableBooks[availableBooks.length - 1];
        availableBooks[ixToRemove] = lastId;
        availableBooks.pop();
        ixAvailableBooks[lastId] = ixToRemove;
    }

    function _includeIdInAvailableBooks(uint256 id) internal {
        availableBooks.push(id);
        ixAvailableBooks[id] = availableBooks.length - 1;
    }

    function _increaseCounter() internal {
        counter++;
    }
}
