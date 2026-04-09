import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Instagram, Facebook } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <Row className="align-items-center gy-3">
          <Col md={7} className="site-footer__copy-wrap">
            <span className="site-footer__eyebrow">Drive with confidence</span>
            <p className="site-footer__copy">
              &copy; {new Date().getFullYear()} CDRIVE, Inc. All Rights Reserved.
            </p>
          </Col>

          <Col md={5}>
            <Nav className="site-footer__social justify-content-md-end">
              <Nav.Item>
                <Nav.Link
                  href="#"
                  className="site-footer__social-link"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  href="#"
                  className="site-footer__social-link"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
