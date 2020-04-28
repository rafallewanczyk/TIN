//
// Created by Jaroslaw Glegola on 13/04/2020.
//
#define CATCH_CONFIG_MAIN // provides main(); this line is required in only one .cpp file

#include "catch.hpp"

int theAnswer() { return 42; } // function to be tested

TEST_CASE("Life, the universe and everything", "[42][theAnswer][test]") {
    REQUIRE(theAnswer() == 42);
}
