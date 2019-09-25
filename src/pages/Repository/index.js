import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';
// import { Container } from './styles';
import { Loading, Owner, IssueList, StateFilter, PageSection } from './style';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: { state, page },
      }),
    ]);
    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  }

  handleStateSelect = async e => {
    this.setState({ state: e.target.value });
    this.loadIssues();
  };

  handlePageNext = e => {
    const { page } = this.state;
    this.setState({ page: page + 1 });
    console.log(page);
    this.loadIssues();
  };

  handlePagePrev = e => {
    const { page } = this.state;
    this.setState({ page: page - 1 });
    this.loadIssues();
  };

  async loadIssues() {
    const { match } = this.props;
    const { state, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: { state, page },
    });

    this.setState({ issues: issues.data });
  }

  render() {
    const { repository, issues, loading, state, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <StateFilter value={state} onChange={this.handleStateSelect}>
          <option value="all">All</option>
          <option value="closed">Closed</option>
          <option value="open">Open</option>
        </StateFilter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <PageSection page>
          <button
            type="button"
            onClick={this.handlePagePrev}
            disabled={page < 2}
          >
            Anterior
          </button>
          <button type="button" onClick={this.handlePageNext}>
            Proxima
          </button>
        </PageSection>
      </Container>
    );
  }
}
