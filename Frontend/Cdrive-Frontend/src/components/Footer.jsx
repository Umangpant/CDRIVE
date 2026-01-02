import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
// We'll use react-bootstrap-icons for the social media icons
import { Instagram, Facebook } from 'react-bootstrap-icons'; 

const Footer = () => {
    return (
        // The Container and Footer tag is styled with margin/padding/border
        // You can add a custom className here if you need more specific styling
        <footer style={{ 
            marginTop: 'auto', // Pushes footer to bottom if content is short
            padding: '20px 0', 
            borderTop: '1px solid #dee2e6' 
        }}>
            <Container>
                <Row className="justify-content-between align-items-center">
                    
                    {/* Left Content: Copyright */}
                    <Col md={6} className="d-flex align-items-center">
                        <span className="text-muted">
                            &copy; {new Date().getFullYear()} CDRIVE, Inc. All Rights Reserved.
                        </span>
                    </Col>

                    {/* Right Content: Social Media Icons */}
                    <Col md={6}>
                        <Nav className="justify-content-end list-unstyled d-flex">
                            <Nav.Item>
                                {/* We use react-bootstrap-icons here */}
                                <Nav.Link href="#" className="text-muted" aria-label="Instagram">
                                    <Instagram size={24} />
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link href="#" className="text-muted" aria-label="Facebook">
                                    <Facebook size={24} />
                                </Nav.Link>
                            </Nav.Item>
                            {/* Add more icons as needed */}
                        </Nav>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
