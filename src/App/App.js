import React, { Component } from "react";
import "./App.scss";
import { withRouter, Route } from "react-router-dom";
import GuestHome from "../GuestHome/GuestHome";
import UserHome from "../UserHome/UserHome";
import LoginPage from "../LoginPage/LoginPage";
import MovieDetails from "../MovieDetails/MovieDetails";
import { getAllMovies, getUserRatedMovies, getAllFavoritesApi } from "../apiCalls/apiCalls";

class App extends Component {
  constructor() {
    super();
    this.state = {
      movies: [],
      error: null,
      userID: null,
      userName: null,
      userRatings: [],
      usersFavorites: [],
      comments: null,
      localStorage: null
    };
  }
  
  componentDidMount = async () => {
    this.verifyLoginLocalStorage();
    try {
      const data = await getAllMovies();
      this.setState({movies: data.movies});
    } catch (error) {
      this.setState({error: error});
    }
  };

  componentDidUpdate = () => {
    let loggedUserId = JSON.stringify(this.state.userID);
    let loggedUserName = JSON.stringify(this.state.userName);
    let loggedRatings = JSON.stringify(this.state.userRatings);
    let loggedFavorites = JSON.stringify(this.state.usersFavorites);

    localStorage.setItem("loggedInUserId", loggedUserId);
    localStorage.setItem("loggedInUserName", loggedUserName);
    localStorage.setItem("loggedRatings", loggedRatings);
    localStorage.setItem("loggedFavorites", loggedFavorites);
  };

  changeUserId = (givenUser) => {
    this.setState({
      userID: givenUser.id,
      userName: givenUser.userName,
      userRatings: [],
      usersFavorites: []
    });
  };

  verifyLoginLocalStorage() {
    let loggedUserId = JSON.parse(localStorage.getItem("loggedInUserId"));
    let loggedUserName = JSON.parse(localStorage.getItem("loggedInUserName"));
    let loggedRatings = JSON.parse(localStorage.getItem("loggedRatings"));
    let loggedFavorites = JSON.parse(localStorage.getItem("loggedFavorites")) || [];

    this.setState({
      userID: loggedUserId,
      userName: loggedUserName,
      userRatings: loggedRatings,
      localStorage: true,
      usersFavorites: loggedFavorites
    });
    
    return loggedUserId;
  };

  getUsersRatings = async (id) => {
    try {
      const data = await getUserRatedMovies(id);
      this.setState({userRatings: data.ratings});
    } catch (error) {
      this.setState({ error: error });
    }
  };

  getAllFavorites = async () => {
    try {
      const favorites = await getAllFavoritesApi();
      this.setState({usersFavorites: favorites});
    } catch (error) {
      this.setState({ error: error });
    }
  };

  render() {
    return (
      <div className="App">
        {!this.state.userID && (
          <Route
            exact
            path="/"
            render={() => (
              <GuestHome
                appState={this.state}
                getUsersRatings={this.getUsersRatings}
              />
            )}
          />
        )}
        <Route
          exact
          path="/login"
          render={() => (
            <LoginPage
              changeUserId={this.changeUserId}
              getUsersRatings={this.getUsersRatings}
              getAllFavorites={this.getAllFavorites}
            />
          )}
        />
        {this.state.userID && (
          <Route
            exact
            path="/"
            render={() => (
              <UserHome
                appState={this.state}
                changeUserId={this.changeUserId}
                getUsersRatings={this.getUsersRatings}
                getAllFavorites={this.getAllFavorites}
              />
            )}
          />
        )}
        <Route
          exact
          path="/movies/:id"
          render={({ match }) => {
            const { id } = match.params;
            const movieToRender = this.state.movies.find(
              (movie) => movie.id === parseInt(id)
            );
            return <MovieDetails appState={this.state} {...movieToRender} />;
          }}
        />
        <Route
          exact
          path="/favorites/"
          render={() => {
            return (
              <UserHome
                appState={this.state}
                changeUserId={this.changeUserId}
                getUsersRatings={this.getUsersRatings}
                getAllFavorites={this.getAllFavorites}
                favorites={true}
              />
            );
          }}
        />
      </div>
    );
  }
}

export default withRouter(App);
