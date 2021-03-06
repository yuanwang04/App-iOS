import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import colors from 'assets/colors';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types';
import {updateContactLog} from './actions.js';
import Import from './Import';
import Location from 'utils/location';
import {strings, fmt_date} from 'locales/i18n';
import CustomIcon from 'assets/icons/CustomIcon.js';
import {deleteLocation} from 'realm/realmLocationTasks';
import {connectActionSheet} from '@expo/react-native-action-sheet';
import Disclaimer from 'Privacy/Disclaimer';
import ImportGoogleTimeline from 'GoogleTimeline/ImportGoogleTimeline';

class LocationsComp extends Component {
  constructor() {
    super();

    this.state = {
      addresses: [],
      visible: false,
      imported: false,
      isImporting: false,
    };
  }

  componentDidMount() {
    const {date} = this.props;
    this.fetchAddresses(date);
  }

  componentDidUpdate(prevProps) {
    const {date} = this.props;
    if (prevProps.date !== date) {
      this.fetchAddresses(date);
    }
  }

  fetchAddresses = async date => {
    const addresses = await Location.fetchAddresses(
      new Date(date.replace(/-/g, '/')),
    );
    this.setState({
      addresses,
    });
  };

  handleAction = address => {
    this.props.showActionSheetWithOptions(
      {
        options: [
          strings('global.cancel'),
          strings('global.edit'),
          strings('global.delete'),
        ],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex === 1) {
          // edit
        } else if (buttonIndex === 2) {
          deleteLocation(address);
          const index = this.state.addresses.findIndex(
            item => item.address === address,
          );

          if (index > -1) {
            this.state.addresses.splice(index, 1);
            this.setState({
              addresses: this.state.addresses,
            });
          }
        }
      },
    );
  };

  render() {
    const {date} = this.props;
    const {addresses} = this.state;

    return (
      <ScrollView>
        <ImportGoogleTimeline
          endDateStr={date}
          dateRange={1}
          visible={this.state.visible}
          handleModalClose={() => {
            this.setState({
              visible: false,
              isImporting: false,
              imported: true,
            }, () => {
              this.fetchAddresses(date)
            });
          }}
        />
        {addresses && addresses.length > 0 ?
          <>
            <Text style={styles.date}>
              {fmt_date(new Date(date.replace(/-/g, '/')), 'ddd, MMM Do')}
            </Text>
            <Text style={styles.sub_header}>
              {strings('locations.timeline_text')}
            </Text>
            {addresses.map((item, idx) => {
              const {name, address, timerange} = item;
              return (
                <View style={styles.address_card} key={idx}>
                  <View style={styles.address_content}>
                    <Text style={styles.name}>{name}</Text>
                    {address !== '' && (
                      <Text style={styles.address}>{address}</Text>
                    )}
                    <Text style={styles.time}>{timerange}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.action_button}
                    onPress={() => this.handleAction(address)}>
                    <CustomIcon
                      name={'action24'}
                      size={20}
                      color={colors.gray_icon}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={styles.missing_locations_container}>
              <Text style={styles.missing_locations_header}>
                {strings('missing_locations.title')}
              </Text>
              <Text style={styles.missing_locations_description}>
                {strings('missing_locations.description')}
              </Text>
              <TouchableOpacity
                style={styles.import_button}
                onPress={() => this.setState({visible: true})}>
                <CustomIcon
                  name={'import24'}
                  size={20}
                  color={colors.primary_theme}
                  style={styles.import_icon}
                />
                <Text style={styles.import_text}>
                  {strings('missing_locations.import_button')}
                </Text>
              </TouchableOpacity>
            </View>
            <Disclaimer />
          </> :
          <Import
            date={date}
            visible={this.state.visible}
            handleModalOpen={() => {
              this.setState({
                visible: true,
              });
            }}
            handleModalClose={() => {
              this.setState({
                visible: false,
                isImporting: false,
                imported: true,
              }, () => {
                this.fetchAddresses(date)
              });
            }}
          />
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  date: {
    fontSize: 18,
    lineHeight: 25,
    color: colors.module_title,
    padding: 20,
  },
  sub_header: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 25,
    textTransform: 'uppercase',
    color: colors.gray_icon,
    paddingHorizontal: 20,
  },
  address_card: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.card_border,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 5,
    paddingVertical: 17,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  address_content: {
    width: 280,
  },
  name: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 23,
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body_copy,
    paddingVertical: 6,
  },
  time: {
    fontSize: 12,
    lineHeight: 15,
    color: colors.body_copy,
    paddingVertical: 6,
  },
  action_button: {
    paddingLeft: 20,
    paddingRight: 15,
  },
  missing_locations_container: {
    padding: 24,
  },
  missing_locations_header: {
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    color: colors.module_title,
    paddingBottom: 15,
  },
  missing_locations_description: {
    fontSize: 12,
    lineHeight: 15,
    color: colors.body_copy,
    paddingBottom: 15,
  },
  import_button: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 16,
    width: 214,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  import_icon: {
    paddingRight: 5,
  },
  import_text: {
    fontWeight: '500',
    color: colors.primary_theme,
  },
});

LocationsComp.propTypes = {
  updateContactLog: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    contactLogData: state.contactLogReducer,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
  updateContactLog
}, dispatch);

const Locations = connectActionSheet(LocationsComp)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Locations);
