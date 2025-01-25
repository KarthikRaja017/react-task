import React, { useEffect, useState } from "react";
import "./App.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import SyntaxHighlighter from "react-syntax-highlighter";
import { marked } from "marked";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Post {
  id: string;
  title: string;
  selftext_html: string | null;
  url: string;
  score: number;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://www.reddit.com/r/reactjs.json");
        const data = await response.json();
        const postsData: Post[] = data.data.children.map(
          (child: { data: Post }) => child.data
        );
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const renderCodeBlock = (
    code: string | string[],
    language: string | undefined
  ) => {
    return (
      <SyntaxHighlighter language={language} style={solarizedlight}>
        {code}
      </SyntaxHighlighter>
    );
  };

  const renderMarkdown = (htmlContent: string) => {
    const parsedContent = marked(htmlContent, {
      breaks: true,
      renderer: new marked.Renderer(),
    });
    // @ts-ignore
    const renderedContent = parsedContent.replace(
      /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
      (match: any, p1: any, p2: any) => {
        return renderCodeBlock(p2, p1);
      }
    );

    return { __html: renderedContent };
  };

  return (
    <div className="app-container">
      <Spin spinning={loading}>
        {!loading && (
          <>
            <h1>ReactJS Subreddit Posts</h1>
            <ul className="post-list">
              {currentPosts.map((post) => {
                const decodedHtml = decodeHtml(post.selftext_html);
                const markdownHtml = renderMarkdown(decodedHtml);
                return (
                  <li className="post-item" key={post.id}>
                    <h2>{post.title}</h2>
                    <div dangerouslySetInnerHTML={markdownHtml} />
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Post
                    </a>
                    <p className="score">Score: {post.score}</p>
                  </li>
                );
              })}
            </ul>
            <div className="pagination">
              <button
                className={`page-btn arrow-btn ${
                  currentPage === 1 ? "disabled" : ""
                }`}
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <LeftOutlined style={{ fontSize: "14px" }} />
              </button>
              {Array.from(
                { length: Math.ceil(posts.length / postsPerPage) },
                (_, index) => (
                  <button
                    key={index + 1}
                    className={`page-btn ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                )
              )}
              <button
                className={`page-btn arrow-btn ${
                  currentPage === Math.ceil(posts.length / postsPerPage)
                    ? "disabled"
                    : ""
                }`}
                onClick={() =>
                  currentPage < Math.ceil(posts.length / postsPerPage) &&
                  paginate(currentPage + 1)
                }
                disabled={
                  currentPage === Math.ceil(posts.length / postsPerPage)
                }
              >
                <RightOutlined style={{ fontSize: "14px" }} />
              </button>
            </div>
            <p>Total Items: {posts.length}</p>
          </>
        )}
      </Spin>
    </div>
  );
};

export default App;
